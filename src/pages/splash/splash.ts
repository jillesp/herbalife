import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';


/**
 * Generated class for the SplashPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-splash',
  templateUrl: 'splash.html',
})
export class SplashPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
  
  private TIME_IN_MS = 3000;
  private hideSplashTimeout() {
    setTimeout( () => {
      this.navCtrl.push(LoginPage);
    }, this.TIME_IN_MS);
  }
  ionViewDidLoad() {
    this.hideSplashTimeout();
  }

}
