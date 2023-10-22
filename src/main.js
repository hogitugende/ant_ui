import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import {
  IonApp, IonPage, IonicVue, IonRouterOutlet, IonIcon, IonTabs, IonLabel,
  IonItem, IonButton, IonButtons, IonCol, IonContent,  IonTitle, IonToolbar,
  IonHeader, IonMenuButton, IonList, IonMenu, IonToggle, IonFooter, IonPopover, IonBadge,
  IonSelectOption, IonSelect, IonDatetime, toastController, alertController,
  IonSlides, IonSlide, IonRippleEffect, IonCheckbox, IonSpinner, IonAlert
} from '@ionic/vue';
import '@ionic/core/css/ionic.bundle.css'
import * as allIcons from "ionicons/icons";
import { App as CapacitorApp } from '@capacitor/app';


window.axios = axios;
const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(store)

const components = {
  IonApp, IonPage, IonicVue, IonRouterOutlet, IonIcon, IonTabs, IonLabel,
  IonItem, IonButton, IonButtons, IonCol, IonContent,  IonTitle, IonToolbar,
  IonHeader, IonMenuButton, IonList, IonMenu, IonToggle, IonFooter, IonPopover, IonBadge,
  IonSelectOption, IonSelect, IonDatetime, toastController, alertController,
  IonSlides, IonSlide, IonRippleEffect, IonCheckbox, IonSpinner, IonAlert
};

Object.entries(components).forEach(([name, component]) => {
  app.component(name, component)
})

app.mixin({
  methods: {
    getIcon(name) {
      return allIcons[name];
    },
    user_is(name) {
      return this.$store.state.user.groups.includes(name)
    },
    initials(fullname){
      if(!fullname){
        return "-"
      }
      let two = fullname.split(" ").slice(0, 2)
      let a = ""
      two.forEach(x => a += x[0])
      return a.toUpperCase()
    },
    logOut(x) {
      alertController.create({
        header: 'Attention!',
        message: 'Voulez-vous vraiment vous deconnecter?',
        buttons: [
          {
            text: 'laisser',
            role: 'cancel'
          },
          {
            text: 'OUI',
            handler: () => {
              localStorage.clear()
              this.$store.state.user = null
              this.$router.push("/auth")
              this.$router.go()
            },
          },
        ],
      }).then(res => {
        res.present();
      });
    },
    money(x) {
      let cash = parseFloat(x).toFixed(0)
      if(!x) return "0";
      return cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },
    makeToast(title, message, duration=5000){
      if(message.toString().includes("</div>")){
        message = "Sorry, something went wrong!"
      }
      toastController.create({
        header: title,
        message: this.cleanString(message).slice(0, 240),
        icon: this.getIcon('informationCircleOutline'),
        duration:duration,
        buttons: [
          {
            text: 'OK',
            handler: () => {}
          }
        ]
      }).then(toast => {
        toast.present();
      });
    },
    cleanString(str){
      if (!str) return "";
      if(typeof(str)=='object'){
        let string = ""
        for( let [clef, valeur] of Object.entries(str)){
          if(typeof(valeur)=='object'){
            let child = ""
            for( let [key, value] of Object.entries(valeur)){
              child += ` ${value} `
            }
            valeur = child;
          }
          string+=`${clef.toUpperCase()}: ${valeur}`
        }
        return string;
      };
      str = str.toString();
      return str.replace( /(<([^>]+)>)/ig, '');
    },
    formatedDatetime(x) {
      if(!x) return "-"
      let date = new Date(x);
      return new Intl.DateTimeFormat(
        'en-GB',
        { dateStyle: 'short', timeStyle: 'short' }
      ).format(date)
    },
    formatedDate(x) {
      const options = { year: "numeric", month: "short", day: "numeric" }
      return new Date(x).toLocaleDateString(undefined, options)
    },
    displayErrorOrRefreshToken(error, callback, elseCallback, verbose=true){
      if(!!error.response){
        if(error.response.data.code == "token_not_valid"){ 
          let refresh = this.$store.state.user.refresh
          if(!refresh){
            this.$store.state.user = null;
            return
          }
          axios.post(this.url+"/refresh/", {"refresh":refresh})
          .then((response) => {
            this.$store.state.user.access = response.data.access
            if(typeof callback == "function") callback()
          }).catch((error) => {
            this.$store.state.user = null;
            console.error(error)
          })
        } else {
          if(verbose)
            this.makeToast('Error', error.response.data)
          if(typeof(elseCallback) == 'function'){
            elseCallback()
          }
        }
      } else {
        if(!!error.message && verbose){
          this.makeToast('Error', error.message)
        }
        console.error(error)
      }
    },
    extractData(fields){
      let data = {}
      fields.forEach(x => {
        data[x.name] = x.value
      })
      return data
    },
    goto(url){
      console.log("redirecting to ", url)
      this.$router.push(url)
      // this.$router.go()
    },
    getTaux(){
      let path = `${this.url}/taux/`;
      axios.get(path, this.headers)
      .then((res) => {
        this.$store.state.taux = res.data.results;
      }).catch((err) => {
        this.displayErrorOrRefreshToken(err, this.getTaux)
      });
    },
    getTransfers(dates, next_url) {
      let url
      if(!!next_url){
        url = next_url
      } else {
        if(!dates){
          url = `${this.url}/transfers/`
        } else {
          url = `${this.url}/transfers/?date__gte=${dates.du}&date__lte=${dates.au}`
        }
      }
      axios.get(url, this.headers)
      .then((res) => {
        let transfers = res.data
        
        if(!transfers.previous){
          this.$store.state.transfers = transfers;
        } else {
          this.$store.state.transfers.results.push(...transfers.results);
        }
        
        window.localStorage.setItem("transfers", JSON.stringify(this.$store.state.transfers))
        
        if(!!transfers.next){
          this.getTransfers(dates, transfers.next)
        }
      }).catch((err) => {
        console.error(err)
        this.displayErrorOrRefreshToken(err, this.getTransfers)
      });
    },
    active_user_is(...groups){
      if(!!this.user){
        for (let group of groups) {
          if(this.user.groups.includes(group)){
            return true
          }
        }
      }
      return false
    },
    getPays() {
      let path = `${this.url}/pays/`;
      axios.get(path, this.headers)
      .then((res) => {
        let pays = res.data.results
        this.$store.state.pays = pays;
        window.localStorage.setItem('pays', JSON.stringify(pays))
      }).catch((err) => {
        this.displayErrorOrRefreshToken(err, this.getPays)
      });
    },
  },
  computed:{
    user(){
    	return this.$store.state.user;
    },
    store_transfers(){
      return this.$store.state.transfers;
    },
    store_notifications(){
      return this.$store.state.notifications;
    },
    url(){
      return this.$store.state.url;
    },
    user_fullname(){
    	if(!this.user) return null
    	return `${this.user.first_name} ${this.user.last_name}`;
    },
    global_pays(){
      return this.$store.state.pays.filter(x => x.nom.toLowerCase() == "burundi").map(x => {
        return { label:x.nom, value:x.id }
      })
    },
    headers(){
      return {
        headers:{
          "Authorization":"Bearer "+this.$store.state.user.access
        }
      }
    }
  }
})
CapacitorApp.addListener('backButton', ({canGoBack}) => {
  if((!canGoBack) || (window.history.state.back == null)){
    CapacitorApp.exitApp();
  } else {
    window.open(window.history.state.back, "_self")
  }
});
app.mount('#app');