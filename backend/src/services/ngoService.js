const db = require('../models/db');

class NgoService {
  async listNgos() {
    const orgs = await db.listOrganizations({ type: 'NGO', verification_status: 'VERIFIED' });
    return orgs;
  }

  async getNgoById(id) {
    const org = await db.getOrganizationById(id);
    if (!org) {
      const err = new Error('NGO organization not found');
      err.statusCode = 404;
      throw err;
    }
    const profile = await db.getProfileByUserId(org.owner_id);
    return { ...org, profile };
  }

  async listBeneficiaries(ngoUserId) {
    return db.listBeneficiariesByNgo(ngoUserId);
  }

  async createBeneficiary(ngoUserId, data) {
    return db.createBeneficiary(ngoUserId, data);
  }

  async deleteBeneficiary(id, ngoUserId) {
    return db.deleteBeneficiary(id, ngoUserId);
  }

  async verifyNgo(orgId, adminId, status = 'VERIFIED') {
    const org = await db.updateOrganization(orgId, { verification_status: status });
    if (!org) {
      const err = new Error('Organization not found');
      err.statusCode = 404;
      throw err;
    }

    // Also verify owner user
    await db.updateUser(org.owner_id, { is_verified: status === 'VERIFIED' });

    // Notify NGO owner
    db.createNotification({
      userId: org.owner_id,
      title: `NGO Verification ${status === 'VERIFIED' ? 'Approved' : 'Updated'}`,
      message: `Your organization "${org.organization_name}" verification status is now: ${status}.`,
      type: 'VERIFICATION_UPDATE',
      link: '/dashboard'
    });

    db.createAuditLog({
      userId: adminId,
      action: 'NGO_VERIFIED',
      entity: 'ORGANIZATION',
      entityId: orgId,
      metadata: { status }
    });

    return org;
  }
}

module.exports = new NgoService();
