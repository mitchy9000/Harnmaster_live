import api from './api.js'

export const characterService = {
  getAll:  ()         => api.get('/characters').then(r => r.data.characters),
  getOne:  (id)       => api.get(`/characters/${id}`).then(r => r.data.character),
  create:  (data)     => api.post('/characters', data).then(r => r.data.character),
  update:  (id, data) => api.put(`/characters/${id}`, data).then(r => r.data.character),
  remove:  (id)       => api.delete(`/characters/${id}`).then(r => r.data),
}