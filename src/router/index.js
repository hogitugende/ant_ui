import { createRouter, createWebHistory } from '@ionic/vue-router';

import Home from '@/views/home/Home'

const routes = [
  { path: '/home', name: 'home', component: Home},
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router