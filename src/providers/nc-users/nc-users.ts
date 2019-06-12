import { HttpClient } from '@angular/common/http';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { User } from '../../models/user';

/*
  Generated class for the NcUsersProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
const JSON_root = "https://api.jsonbin.io/";
const JSON_users_access_key = "5b5b5ca7dc72f955bb796413";
const JSON_secret_key = "$2a$10$NIl4UEjdKgrxPQs3Z.f8q.HRPDVYNm0IIMLhH5cflTwpcshLO1.Cm";

@Injectable()
export class NcUsersProvider {
  
  constructor(public http: HttpClient) {
  }

  loadNCUsers(): Observable<User[]> {
    let JSONreq = JSON_root + "b/" + JSON_users_access_key;
    return this.http.get(JSONreq, {headers: {'secret-key': JSON_secret_key}}).map(data => <User[]>data);
  }

}
