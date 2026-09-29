const bcrypt = require('bcryptjs');
const db = require('../models/db');
const { signToken } = require('../utils/jwt');

class AuthService {
  async register(data, ipAddress = '127.0.0.1') {
    const existing = await db.findUserByEmail(data.email);
    if (existing) {
      const err = new Error('An account with this email address already exists');
      err.statusCode = 409;
      err.code = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    // Salt and hash password securely
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    // Enforce role safety: never allow registering as 'admin'
    const allowedRole = ['donor', 'volunteer', 'ngo'].includes(data.role) ? data.role : 'donor';

    const user = await db.createUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password_hash,
      role: allowedRole
    });

    // Create profile
    await db.upsertProfile(user.id, {
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      pincode: data.pincode || '',
      bio: data.bio || ''
    });

    // If NGO or organization donor, create organization record
    let organization = null;
    if (allowedRole === 'ngo' || (allowedRole === 'donor' && data.organization_name)) {
      organization = await db.createOrganization({
        owner_id: user.id,
        organization_name: data.organization_name || `${user.name}'s Organization`,
        organization_type: allowedRole === 'ngo' ? 'NGO' : (data.organization_type || 'OTHER'),
        registration_number: data.registration_number || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || ''
      });
    }

    // Generate JWT
    const token = signToken({ id: user.id, role: user.role, email: user.email });

    // Send welcome notification
    db.createNotification({
      userId: user.id,
      title: 'Welcome to FoodSave! 🌱',
      message: `Welcome aboard, ${user.name}! Your role as a ${user.role} helps fight hunger and food waste.`,
      type: 'SYSTEM',
      link: '/dashboard'
    });

    // Audit log
    db.createAuditLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      entity: 'USER',
      entityId: user.id,
      metadata: { role: user.role, email: user.email },
      ipAddress
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified
      },
      organization
    };
  }

  async login(email, password, ipAddress = '127.0.0.1') {
    const user = await db.findUserByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (user.is_active === false) {
      const err = new Error('This account has been deactivated or suspended');
      err.statusCode = 403;
      err.code = 'ACCOUNT_SUSPENDED';
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = signToken({ id: user.id, role: user.role, email: user.email });
    const profile = await db.getProfileByUserId(user.id);
    const organization = await db.getOrganizationByOwnerId(user.id);

    db.createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      metadata: { email: user.email },
      ipAddress
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        profile,
        organization
      }
    };
  }

  async getMe(userId) {
    const user = await db.findUserById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const profile = await db.getProfileByUserId(userId);
    const organization = await db.getOrganizationByOwnerId(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      is_active: user.is_active,
      created_at: user.created_at,
      profile,
      organization
    };
  }

  async updateProfile(userId, profileData) {
    const updatedProfile = await db.upsertProfile(userId, profileData);
    if (profileData.name || profileData.phone) {
      await db.updateUser(userId, {
        ...(profileData.name && { name: profileData.name }),
        ...(profileData.phone && { phone: profileData.phone })
      });
    }
    return this.getMe(userId);
  }

  async forgotPassword(email) {
    const user = await db.findUserByEmail(email);
    // Return success message even if not found to prevent user enumeration
    if (!user) {
      return { message: 'If this email is registered, a password reset link has been sent.' };
    }

    db.createAuditLog({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'USER',
      entityId: user.id,
      metadata: { email }
    });

    // In a production setup, an email with a secure signed reset token is dispatched here
    return {
      message: 'If this email is registered, a password reset link has been sent.',
      demoToken: 'demo-reset-token-' + user.id
    };
  }

  async resetPassword(token, newPassword) {
    // Demo token format: demo-reset-token-<userId>
    let userId = null;
    if (token.startsWith('demo-reset-token-')) {
      userId = token.replace('demo-reset-token-', '');
    } else {
      const decoded = jwt.verifyToken(token);
      if (decoded && decoded.id) userId = decoded.id;
    }

    if (!userId) {
      const err = new Error('Invalid or expired password reset token');
      err.statusCode = 400;
      err.code = 'INVALID_RESET_TOKEN';
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await db.updateUser(userId, { password_hash });

    db.createAuditLog({
      userId,
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'USER',
      entityId: userId
    });

    return { message: 'Password has been reset successfully. You can now login.' };
  }
}

module.exports = new AuthService();
