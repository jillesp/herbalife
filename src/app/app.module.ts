import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { LoginPage } from '../pages/login/login';
import { LocatorPage } from '../pages/locator/locator';
import { SplashPage } from '../pages/splash/splash';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ComponentsModule } from '../components/components.module';
import { NcLocationsProvider } from '../providers/nc-locations/nc-locations';
import { NcUsersProvider } from '../providers/nc-users/nc-users';

import { AgmCoreModule } from '@agm/core';          
import { AgmDirectionModule } from 'agm-direction';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    LocatorPage,
    SplashPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp),
    AgmCoreModule.forRoot({ 
      apiKey: 'AIzaSyC-JGJZ5de-LjdH57moTRnax1R2KVHhMwg',
    }),
    AgmDirectionModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    LocatorPage,
    SplashPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NcLocationsProvider,
    NcUsersProvider
  ]
})
export class AppModule {}
