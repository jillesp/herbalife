import { Component, Input, Renderer2, ElementRef, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import {} from '@types/googlemaps';
import { Searchbar } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

import { Location } from '../../models/location';
import { NcLocationsProvider } from '../../providers/nc-locations/nc-locations';

const { Geolocation, Network } = Plugins;
 
@Component({
  selector: 'google-maps',
  templateUrl: 'google-maps.html'
})
export class GoogleMapsComponent {
 
    @Input('apiKey') apiKey: string;
 
    public map: any;
    public popup: any;
    public markers: any[] = [];
    private mapsLoaded: boolean = false;
    private networkHandler = null;
    private infowindow: any;
    private content: any[] = [];
    private listDisabled: boolean = true;
    private srcJSON: any;
    
    @ViewChild('locatorSearch') locatorSearch: Searchbar;

    constructor(private renderer: Renderer2, private element: ElementRef, @Inject(DOCUMENT) private _document, public http: HttpClient, public locationsProvider: NcLocationsProvider){
 
    }
 
    ngOnInit(){
 
        this.init().then((res) => {
            console.log("Google Maps ready.")
        }, (err) => {   
            console.log(err);
        });
 
    }
 
    private init(): Promise<any> {
 
        return new Promise((resolve, reject) => {
 
            this.loadSDK().then((res) => {
 
                this.initMap().then((res) => {
                    resolve(true);
                }, (err) => {
                    reject(err);
                });
 
            }, (err) => {
 
                reject(err);
 
            });
 
        });
 
    }
 
    private loadSDK(): Promise<any> {
 
        console.log("Loading Google Maps SDK");
 
        return new Promise((resolve, reject) => {
 
            if(!this.mapsLoaded){
 
                Network.getStatus().then((status) => {
 
                    if(status.connected){
 
                        this.injectSDK().then((res) => {
                            resolve(true);
                        }, (err) => {
                            reject(err);
                        });
 
                    } else {
 
                        if(this.networkHandler == null){
 
                            this.networkHandler = Network.addListener('networkStatusChange', (status) => {
 
                                if(status.connected){
 
                                    this.networkHandler.remove();
 
                                    this.init().then((res) => {
                                        console.log("Google Maps ready.")
                                    }, (err) => {   
                                        console.log(err);
                                    });
 
                                }
 
                            });
 
                        }
 
                        reject('Not online');
                    }
 
                }, (err) => {
 
                    // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
                    if(navigator.onLine){
 
                        this.injectSDK().then((res) => {
                            resolve(true);
                        }, (err) => {
                            reject(err);
                        });
 
                    } else {
                        reject('Not online');
                    }
 
                });
 
            } else {
                reject('SDK already loaded');
            }
 
        });
 
 
    }
 
    private injectSDK(): Promise<any> {
 
        return new Promise((resolve, reject) => {
 
            window['mapInit'] = () => {
                this.mapsLoaded = true;
                resolve(true);
            }
 
            let script = this.renderer.createElement('script');
            script.id = 'googleMaps';
 
            if(this.apiKey){
                script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&libraries=places&callback=initAutocomplete' + '&callback=mapInit';
                // script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
                
            } else {
                script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';      
            }
 
            this.renderer.appendChild(this._document.body, script);
 
        });
 
    }
 
    private initMap(): Promise<any> {

        return new Promise((resolve, reject) => {
 
            Geolocation.getCurrentPosition().then((position) => {
 
                let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
                let mapOptions = {
                    center: latLng,
                    zoom: 15
                };
 
                this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
                resolve(true);

                this.locationsProvider.loadNCLocations().subscribe(locations => {
                    this.srcJSON = locations;
                    this.addMarkers(this.srcJSON);
                })

            }, (err) => {
 
                reject('Could not initialise map');
 
            });

 
        });
 
    }

    private addMarkers(srcJSON): void {

        let testJSON = srcJSON;
        
        this.infowindow = new google.maps.InfoWindow({
            pixelOffset: new google.maps.Size(16, 18)
        });

        for( var i in testJSON.locations) {
            let x = testJSON.locations[i].coordinates.x;
            let y = testJSON.locations[i].coordinates.y;
            let latLng = new google.maps.LatLng(x, y);
            
            let content = testJSON.locations[i];
            let formattedContent = '<div class="locator-content">' +
                                        '<div class="content content-name">' +
                                            '<img src="assets/imgs/icon_herbalife.png" />' +
                                            '<p>'+ content.name +'</p>' +
                                        '</div>' +
                                        '<div class="content content-address">' +
                                            '<fa-icon class="fas fa-map-marked-alt" color="light"></fa-icon>' +
                                            '<p>'+ content.address +'</p>' +
                                        '</div>' +
                                        '<div class="content content-contact">' +
                                            '<fa-icon class="fas fa-users" color="light"></fa-icon>' +
                                            '<p>'+ content.owner +'</p>' +
                                            '<p>'+ content.contact +'</p>' +
                                        '</div>' +
                                        '<div class="content content-hours">' +
                                            '<fa-icon class="fas fa-clock" color="light"></fa-icon>' +
                                            '<p>'+ content.hours +'</p>' +
                                        '</div>' +
                                    '</div>'

            let marker = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                icon: './assets/imgs/marker_herbalife.png',
                position: latLng
            });
            
            this.markers.push(marker);
            this.content.push(formattedContent);

            this.addInfoWindow(marker, formattedContent);
        }
    }

    private addInfoWindow(marker, content){
        this.infowindow = new google.maps.InfoWindow({
            pixelOffset: new google.maps.Size(16, 18),
        });
        
        google.maps.event.addListener(marker, 'click', () => {
            if (this.infowindow) {this.infowindow.close();}
            this.infowindow.setContent(content);
            this.infowindow.open(this.map, marker);
            let target = document.getElementsByClassName("gm-style-iw")[0];
                target = target.parentElement;
                target.className = 'locator-content_root';
            this.map.panTo(marker.position);
            this.setIsListDisabled(true);
        });

    }

    private renderInfoWindow(info, map, marker) {
        if (this.infowindow) {this.infowindow.close();}
        this.infowindow.setContent(info);
        this.infowindow.open(map, marker);
        let target = document.getElementsByClassName("gm-style-iw")[0];
            target = target.parentElement;
            target.className = 'locator-content_root';
        this.map.panTo(marker.position)
        this.setIsListDisabled(true);
    }

    public searchQuery(query){
        let testJSON = this.srcJSON;
        if(query) {
            return testJSON.locations.filter((item) => {
                return item.area.toLowerCase().indexOf(query.toLowerCase()) > -1 || item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 || item.owner.toLowerCase().indexOf(query.toLowerCase()) > -1 || item.tabTeam.toLowerCase().indexOf(query.toLowerCase()) > -1;
            });    
        };
    }

    public setIsListDisabled(listDisabled) {
        this.listDisabled = listDisabled;
    }

    public getIsListDisabled() {
        return this.listDisabled;
    }

    public getMarker(tmpId) {
        this.renderInfoWindow(this.content[tmpId], this.map, this.markers[tmpId]);
    }

}