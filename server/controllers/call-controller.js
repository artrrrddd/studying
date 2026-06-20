const callService = require('../service/call-service');

class CallController {
  async create(req, res, next) {
    try {
      const call = await callService.createCall(req.user.id, req.body);
      return res.json(call);
    } catch (e) {
      next(e);
    }
  }

  async getMine(req, res, next) {
    try {
      const calls = await callService.getMyCalls(req.user.id);
      return res.json(calls);
    } catch (e) {
      next(e);
    }
  }

  async getById(req, res, next) {
    try {
      const call = await callService.getCallById(req.user.id, req.params.id);
      return res.json(call);
    } catch (e) {
      next(e);
    }
  }

  async join(req, res, next) {
    try {
      const joinData = await callService.joinCall(req.user.id, req.params.id);
      return res.json(joinData);
    } catch (e) {
      next(e);
    }
  }

  async joinByCode(req, res, next) {
    try {
      const joinData = await callService.joinCallByInviteCode(
        req.user.id,
        req.body.inviteCode
      );
      return res.json(joinData);
    } catch (e) {
      next(e);
    }
  }

  async createInvite(req, res, next) {
    try {
      const invite = await callService.createInvite(
        req.user.id,
        req.params.id,
        req.body
      );
      return res.json(invite);
    } catch (e) {
      next(e);
    }
  }

  async end(req, res, next) {
    try {
      const call = await callService.endCall(req.user.id, req.params.id);
      return res.json(call);
    } catch (e) {
      next(e);
    }
  }

  async removeParticipant(req, res, next) {
    try {
      const participant = await callService.removeParticipant(
        req.user.id,
        req.params.id,
        req.params.userId
      );
      return res.json(participant);
    } catch (e) {
      next(e);
    }
  }

  async updateParticipantPermissions(req, res, next) {
    try {
      const participant = await callService.updateParticipantPermissions(
        req.user.id,
        req.params.id,
        req.params.userId,
        req.body.permissions || req.body
      );
      return res.json(participant);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new CallController();
