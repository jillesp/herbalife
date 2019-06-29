import { HttpClient } from '@angular/common/http';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Location } from '../../models/location';

/*
  Generated class for the NcLocationsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
const JSON_root = "https://api.jsonbin.io/";
const JSON_locations_access_key = "5b58abf9dc72f955bb77ef60/2";
const JSON_secret_key = "$2a$10$NIl4UEjdKgrxPQs3Z.f8q.HRPDVYNm0IIMLhH5cflTwpcshLO1.Cm";

@Injectable()
export class NcLocationsProvider {
  
  constructor(public http: HttpClient) {
  }

  loadNCLocations(): Observable<Location[]> {
    let JSONreq = JSON_root + "b/" + JSON_locations_access_key;
    return this.http.get(JSONreq, {headers: {'secret-key': JSON_secret_key}}).map(data => <Location[]>data);
  }

}
