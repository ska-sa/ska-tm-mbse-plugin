import { Component, Inject } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { FormsModule } from '@angular/forms';
import { InstitutionsAccess } from '../../app/services/institutions/institutions';
import { SubjectsAccess } from '../../app/services/subjects/subjects';
import { userAccess } from '../../app/services/users/users';
import { TutorhomePage } from '../tutorhome/tutorhome';


import { Http, Headers } from '@angular/http';
import 'rxjs/Rx';

import { Events } from 'ionic-angular';

import { NativeStorage } from '@ionic-native/native-storage';

import { GooglePlus } from '@ionic-native/google-plus';

import * as firebase from 'firebase/app';
import 'firebase/messaging';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { FirebaseApp } from 'angularfire2'
import { Firebase } from '@ionic-native/firebase'
/**
 * Generated class for the TutorregisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-tutorregister',
  templateUrl: 'tutorregister.html',
})
export class TutorregisterPage {
  browse: string = "info";
  users: userAccess;
  subinterests: Array<any> = [];

  private fname: string = '';
  private sname: string = '';
  private grd: string = '';
  private sch: string = '';
  private cell: string = '';
  private sub: string = '';
  private email: string = '';

  private user;
  private gUser;
  private authState;

  private type = "tutor";
  private institutions;
  private subjects;
  private ayos: string = '';
  private ins: string = '';
  private hq: string = '';
  private degree: string = '';
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public alertCtrl: AlertController,
    private institutionsAccess: InstitutionsAccess,
    private subjectsAccess: SubjectsAccess,
    public events: Events, 
    public loadingCtrl: LoadingController,
    private googlePlus: GooglePlus,
    public afAuth: AngularFireAuth, 
    private af: AngularFireDatabase,
    private nativeStorage: NativeStorage, private fcm: Firebase) {
      this.institutions = this.institutionsAccess.getUniversities();
      this.subjects = this.subjectsAccess.getSubjects();
      this.addsubinterest();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TutorregisterPage');
  }
  addsubinterest() {
    this.subinterests.push('');
  } 
  next(){
    this.browse = "details";
  }

  private loader = this.loadingCtrl.create({
      content: "Registering..."
  });

  private completing = this.loadingCtrl.create({
      content: "Completing registration..."
  });

  googleReg() {
    this.loader.present();
    this.googlePlus.login({
            //'webClientId': '559242294803-iel70p87sa56tv4leg3hosnbu46lrtfc.apps.googleusercontent.com',
            'webClientId': '745996686081-ta15tog2jhd7v3832l95874i2ng8c3m6.apps.googleusercontent.com',
            'offline': true})
            .then((success) =>{
              this.gglogged(success);
            })
            .catch((err) => {
              alert('Login failed!' + err);
              this.ggfail();
            });
  }
  ggfail(){
    this.loader.dismiss();
    setTimeout(()=>{this.showDeny();}, 200);
  }
  gglogged(result){
    this.loader.dismiss();
    this.fireAuth(result);
  }
  fireAuth(successuser) {
    this.gUser = successuser;
    var type ='';
    var credential = firebase.auth.GoogleAuthProvider.credential(
              successuser.idToken); //WE NEED TO SAVE THIS TO CACHE FOR SILENT LOGIN
      let env = this;
      firebase.auth().signInWithCredential(credential).then((result) => {
        
        var user = result;
        env.user = result;
        env.completing.present();
        env.authState = env.afAuth.authState;
        env.authState.subscribe(user => {
          if (user) {
            env.fcm.getToken().then(token => {
                firebase.database().ref(`/users_tokens/${user.uid}`).update({[token]:true})   
            })

            env.fcm.onTokenRefresh()
              .subscribe((token: string) =>  firebase.database().ref(`/users_tokens/${user.uid}`).update({[token]:true}) );
              
            
            env.events.publish('globals:update', user, 'tutor');
            if(env.email.length < 1) {
              env.email = user.email;
            } 
            env.reg();
          } else {
            alert('Please check your internet connection and try again')
          }
        });
      }).catch(err => {
        alert('Authentication error');
      });
  }

  
  reg(){
    let env = this;
    this.completing.present();
    firebase.database().ref(`/users_tutors/${this.user.uid}`).update({
      institution: env.ins,
      highest_qualification: env.hq,
      degree: env.degree,
      subjects: env.subinterests,
      name: env.fname,
      lastname: env.sname,
      displayname: env.user.displayName,
      imageurl: env.user.photoURL,
      coverurl: '',
      cellphone: env.cell,
      email: env.email,
      bio: '...',
      nickname: '...',
      status: 'online',
      likes: 0,
      ayos: env.ayos  
    })
    firebase.database().ref(`/users_global/${this.user.uid}`).update({
      type: env.type,
      institution: env.ins,
      highest_qualification: env.hq,
      degree: env.degree,
      subjects: env.subinterests  
    })
    firebase.database().ref(`/users_tutors/${this.user.uid}/education`).push({
      institution: 'university',
      status: 'in progress',
      start: (new Date()).getTime(), //we need a date-time picker for this
      end: (new Date()).getTime(),
      degree: env.degree,
    })
    firebase.database().ref(`/users_tutors/${this.user.uid}/education`).push({
      institution: 'school',
      status: 'complete',
      start: (new Date()).getTime(), //we need a date-time picker for this
      end: (new Date()).getTime(),
      certificate: 'NSC/IEB/A Levels',
    })
    this.showAlert();
    
  }

  showAlert() {
    this.completing.dismiss();
    this.navCtrl.setRoot(TutorhomePage, {user: this.user});
    this.nativeStorage.setItem('user-info', {user: this.user, type: 'tutor'});
    /*let alert = this.alertCtrl.create({
      title: 'Registered!',
      subTitle: 'Welcome to Enlighten!',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            
          }
        }]
    });
    alert.present();*/
  }
  showDeny() {
    let alert = this.alertCtrl.create({
      title: 'Already Registered!',
      subTitle: 'This account is already used, please go to the Login Page!',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.navCtrl.remove(2,1); // This will remove the 'ResultPage' from stack.
            this.navCtrl.pop();
          }
        }]
    });
    alert.present();
  }

}
