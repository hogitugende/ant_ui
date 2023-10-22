<template>
  <ion-page>
    <ion-content class="ion-no-padding">
      <ion-router-outlet/>
      <div id="menus">
        <router-link to="/"
          v-slot="{ href, navigate, isActive, isExactActive }">
          <div class="menu" :class="{'active':isExactActive}">
            <div class="shadow"></div>
            <ion-button
              shape=round
              color=primary
              fill="solid"
              :routerLink="href">
              <ion-icon color=secondary :icon="getIcon('home')"/>
            </ion-button>
          </div>
        </router-link>

        <router-link to="/actions"
          v-slot="{ href, navigate, isActive, isExactActive }">
          <div class="menu" :class="{'active':$route.path.includes(href)}">
            <div class="shadow"></div>
            <ion-button
              shape=round
              color=primary
              fill="solid"
              :routerLink="href">
              <ion-icon color=secondary :icon="getIcon('newspaper')"/>
            </ion-button>
          </div>
        </router-link>
        <router-link to="/new"
          v-if="!active_user_is('Admin')"
          v-slot="{ href, navigate, isActive, isExactActive }">
          <div class="menu" :class="{'active':$route.path.includes(href)}">
            <div class="shadow"></div>
            <ion-button
              shape=round
              color=primary
              fill="solid"
              :routerLink="href">
              <ion-icon color=secondary :icon="getIcon('paperPlane')"/>
            </ion-button>
          </div>
        </router-link>
        <router-link to="/notifications"
          v-slot="{ href, navigate, isActive, isExactActive }">
          <div class="menu" :class="{'active':isActive}">
            <div class="shadow"></div>
            <ion-button
              shape=round
              color=primary
              fill="solid"
              :routerLink="href">
              <ion-icon color=secondary :icon="getIcon('notifications')"/>
              <div class="notifs">
                {{ store_notifications.filter(x => !x.lue).length }}
              </div>
            </ion-button>
          </div>
        </router-link>
        <router-link to="/settings"
          v-slot="{ href, navigate, isActive, isExactActive }">
          <div class="menu" :class="{'active':isActive}">
            <div class="shadow"></div>
            <ion-button
              shape=round
              color=primary
              fill="solid"
              :routerLink="href">
              <ion-icon color=secondary :icon="getIcon('settings')"/>
            </ion-button>
          </div>
        </router-link>
      </div>
    </ion-content>
    <ChangeRate
      :active="$store.state.rate_shown"
      @close="$store.state.rate_shown=false"/>
  </ion-page>
</template>

<script>
import ChangeRate from "@/components/dialogs/dialog_change_rate"
import { registerPlugin } from '@capacitor/core';

export default {
  components:{
    ChangeRate
  },
  data(){
    return {
    }
  },
  mounted(){
    let transfers = JSON.parse(window.localStorage.getItem('transfers'))
    this.$store.state.transfers = transfers
    this.getTransfers();
    this.getTaux();
  }
}
</script>
<style scoped>
#menus{
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: var(--ion-color-primary);
  display: flex;
  justify-content: space-evenly;
  border-top: 3px solid white;
}
.active{
  position: relative;
  top: -25px;
  border-radius: 50%;
  overflow: hidden;
  padding: 4px;
  display: flex;
  justify-content: center;
}
a{
  position: relative;
}
a:has(.active):before{
  position: absolute;
  left: -7px;
  rotate: -25deg;
  border-top-right-radius: 50% 80%;
  box-shadow: 4px -1px 0 0 white;
  content: "";
  color: red;
  width: 8px;
  height: 15px;
  background-color: var(--ion-color-primary);
  z-index: 1;
}
a:has(.active):after{
  position: absolute;
  right: -7px;
  rotate: 25deg;
  top: 0;
  border-top-left-radius: 50% 80%;
  box-shadow: -4px -1px 0 0 white;
  content: "";
  color: red;
  width: 8px;
  height: 15px;
  background-color: var(--ion-color-primary);
  z-index: 1;
}
.active .shadow{
  width: 100%;
  height: 50%;
  bottom: 0;
  background-color: white;
  position: absolute;
}
ion-button{
  width: 40px;
  height: 40px;
  --padding-end: 0;
  --padding-start: 0;
  --box-shadow:none;
}
.menu{
  position: relative;
}
.notifs{
  position: absolute;
  z-index: 3;
  background-color: red;
  font-weight: 600;
  border-radius: 5px;
  padding: 1px 3px;
  top:5px;
  right:5px;
  font-size: .9em;
}
</style>
