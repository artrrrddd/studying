import $api from '../http';

export const callsApi = {
  createCall(payload) {
    return $api.post('/calls', payload).then((res) => res.data);
  },

  getMyCalls() {
    return $api.get('/calls').then((res) => res.data);
  },

  getCall(id) {
    return $api.get(`/calls/${id}`).then((res) => res.data);
  },

  joinCall(id) {
    return $api.post(`/calls/${id}/join`).then((res) => res.data);
  },

  endCall(id) {
    return $api.post(`/calls/${id}/end`).then((res) => res.data);
  },

  createInvite(id, payload) {
    return $api.post(`/calls/${id}/invites`, payload).then((res) => res.data);
  },

  joinByCode(inviteCode) {
    return $api.post('/calls/join-by-code', { inviteCode }).then((res) => res.data);
  },

  updateParticipantPermissions(id, userId, permissions) {
    return $api
      .patch(`/calls/${id}/participants/${userId}/permissions`, { permissions })
      .then((res) => res.data);
  },

  removeParticipant(id, userId) {
    return $api.delete(`/calls/${id}/participants/${userId}`).then((res) => res.data);
  },
};
