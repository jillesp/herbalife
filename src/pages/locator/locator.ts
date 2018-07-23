import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GoogleMapsComponent } from '../../components/google-maps/google-maps';

/**
 * Generated class for the LocatorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-locator',
  templateUrl: 'locator.html',
})

export class LocatorPage {
 
    @ViewChild(GoogleMapsComponent) mapComponent: GoogleMapsComponent;

    public items: any;
    public query: string = "";

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }
 
    public getItems(ev: any) {
      const q = ev.target.value;
      this.mapComponent.searchQuery(q);
    }

    public setFilteredItems() {
      this.items = this.mapComponent.searchQuery(this.query);
      this.mapComponent.setIsListDisabled(false);
    }

    public callItem(item) {
      this.mapComponent.getMarker(item.tmpId);
    }

    public isListDisabled() {
      return this.mapComponent.getIsListDisabled();
    }

    ionViewDidLoad() {
      this.setFilteredItems();
    }
 
}