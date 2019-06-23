/// <reference types="@types/googlemaps" />
import { Component, Input, Renderer2, ElementRef, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import {} from 'googlemaps';
import { Searchbar } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { NcLocationsProvider } from '../../providers/nc-locations/nc-locations';

const { Network } = Plugins;
 
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
    private directions: any; 
    private location: any;
    
    @ViewChild('locatorSearch') locatorSearch: Searchbar;

    constructor(private renderer: Renderer2, private element: ElementRef, @Inject(DOCUMENT) private _document, public http: HttpClient, public locationsProvider: NcLocationsProvider){
    }
    
    ngOnInit(){
        this.initGMaps().then((res) => {
            console.log("Google Maps ready.")
            this.locationsProvider.loadNCLocations().subscribe(locations => {
                this.srcJSON = locations;
                if(this.srcJSON) {
                    console.log("Loading markers..");
                    this.initMarkers(this.srcJSON);
                }
            })
        }, (err) => {   
            console.log(err);
        });
    }
 
    private initGMaps(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.loadSDK().then((res) => {
                this.initMap().then( async (res) => {
                    // Use location to set where map will load
                    // if (navigator.geolocation) {
                    //     navigator.geolocation.getCurrentPosition( async function(position) {
                    //         let coords = await new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    //         this.map.setCenter(coords);
                    //     })
                    // }
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
        console.log("Loading Google Maps SDK..");
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
                                    this.initGMaps().then((res) => {
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
        return new Promise((resolve) => {
            window['mapInit'] = () => {
                this.mapsLoaded = true;
                resolve(true);
            }
            let script = this.renderer.createElement('script');
            script.id = 'googleMaps';
            if(this.apiKey){
                script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&libraries=places&callback=initAutocomplete' + '&callback=mapInit';
            } else {
                script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';      
            }
            this.renderer.appendChild(this._document.body, script);
        });
    }
 
    private async initMap(): Promise<any> {
        this.map = await new google.maps.Map(this.element.nativeElement, {
            center: await new google.maps.LatLng(14.561033, 120.9969269),
            zoom: 12.5
        });
    }

    private async handleDirections(coords) {
        await navigator.geolocation.getCurrentPosition( (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            const location = "https://www.google.com/maps/dir/?api=1&origin="+ pos.lat + "," + pos.lng + "&destination=" + coords + "&travelmode=driving&sensor=true";
            window.location.href = location
        }, 
        (error) => {
            if( error.message.includes("Timeout")) {
                alert("Current location could not be found. Please turn on GPS or Location to proceed with directions.")
            } else {
                const location = "https://www.google.com/maps/@?api=1&map_action=map&center=" + coords;
                window.location.href = location;
            }
        }, {
            timeout: 2000
        });
    }

    private async initMarkers(srcJSON) {
        let testJSON = srcJSON;
        this.infowindow = new google.maps.InfoWindow();
        for( var i in testJSON.locations) {
            let x = testJSON.locations[i].coordinates.x;
            let y = testJSON.locations[i].coordinates.y;
            let latLng = new google.maps.LatLng(x, y);
            let content = testJSON.locations[i];
            let formattedContent = '<div class="locator-content">' +
                                        '<div class="content content-name">' +
                                            '<img src="assets/imgs/icon_herbalife.png" />' +
                                            '<p>'+ content.name +'</p>' +
                                            '<fa-icon class="fas fa-external-link-square-alt href-ctrl" color="light"></fa-icon>' +
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
            marker.addListener('click', () => {
                this.renderInfoWindow(formattedContent, marker);
            });
            this.markers.push(marker);
            this.content.push(formattedContent);
        }
    }

    private async renderInfoWindow(info, marker) {
        if (this.infowindow) this.infowindow.close();
        await this.infowindow.setContent(info);
        await this.infowindow.open(this.map, marker);
        let target = document.getElementsByClassName("gm-style-iw")[0];
        if(target) {
            target = target.parentElement;
            target.className = 'locator-content_root';
        }
        let pos = await {lat: marker.position.lat() + .005, lng: marker.position.lng()}
        this.element.nativeElement.querySelector(".href-ctrl").addEventListener("click", (e) => {
            this.handleDirections(marker.position);
        })
        this.map.panTo(pos)
        this.setIsListDisabled(true);
    }

    public searchQuery(query){
        if(this.srcJSON) {
            let testJSON = this.srcJSON;
            if(query) {
                return testJSON.locations.filter((item) => {
                    return item.area.toLowerCase().indexOf(query.toLowerCase()) > -1 || item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 || item.owner.toLowerCase().indexOf(query.toLowerCase()) > -1 || item.tabTeam.toLowerCase().indexOf(query.toLowerCase()) > -1;
                });    
            };
        }
    }

    public setIsListDisabled(listDisabled) {
        this.listDisabled = listDisabled;
    }

    public getIsListDisabled() {
        return this.listDisabled;
    }

    public getMarker(tmpId) {
        this.renderInfoWindow(this.content[tmpId], this.markers[tmpId]);
    }

}