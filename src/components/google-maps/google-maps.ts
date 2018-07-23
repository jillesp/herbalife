import { Component, Input, Renderer2, ElementRef, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import {} from '@types/googlemaps';
import { Searchbar } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
 
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
    private locationsSrc = "http://localhost:8100/assets/backup/locations.json"
    private infowindow: any;
    private content: any[] = [];
    private listDisabled: boolean = true;
    private srcJSONx: any;
    
    @ViewChild('locatorSearch') locatorSearch: Searchbar;

    constructor(private renderer: Renderer2, private element: ElementRef, @Inject(DOCUMENT) private _document, public http: HttpClient){
 
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
 
                // console.log(position);
 
                let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
                let mapOptions = {
                    center: latLng,
                    zoom: 15
                };
 
                this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
                resolve(true);

                this.addMarkers();
 
            }, (err) => {
 
                reject('Could not initialise map');
 
            });

 
        });
 
    }

    private initSource(): any {
        var srcJSON = {
            "locations": [
                {
                    "tmpId": 0,
                    "area": "ORTIGAS",
                    "name": "I Fit Ortigas Club",
                    "owner": "Miles Bonoan / MillTeam",
                    "address": "LG11 CITY & L AND MEGA PLAZA Bldg AD B  AVE, CORNER GARNET ROAD, ORTIGAS, PASIG CITY, 1605",
                    "hours": "6:30AM - 9AM, 11:30AM - 1:30PM, 5PM - 8PM / 8AM - 12AM on Saturdays",
                    "contact": "09178553071",
                    "tabTeam": "Ting / Beng Medina",
                    "coordinates": {x: 14.5891073, y: 121.0584236}
                },
                {
                    "tmpId": 1,
                    "area": "MANDALUYONG",
                    "name": "The Shaping Bay",
                    "owner": "Sol Fernando / AWT",
                    "address": "85 SGT. BUMATAY ST., PLAINVIEW, MANDALUYONG CITY",
                    "hours": "N/A",
                    "contact": "5343288 / 2390949, Sol Fernando: 09178420362, Myrna Fernando 09332022471",
                    "tabTeam": "Miles Bonoan",
                    "coordinates": {x: 14.5762509, y: 121.0316237}
                },
                {
                    "tmpId": 2,
                    "area": "MANILA",
                    "name": "Herbalife Sitio Grande",
                    "owner": "Mhay / Mike Reyes",
                    "address": "3rd FLR., SITIO GRANDE BLDG., 409 A. SORIANO AVE., INTRAMUROS, MANILA",
                    "hours": "Breakfast to Lunch",
                    "contact": "(0927) 728 9037 Mhay and Mike Reyes",
                    "tabTeam": "Miles Bonoan",
                    "coordinates": {x: 14.5934652, y: 120.9715733}
                },
                {
                    "tmpId": 3,
                    "area": "QUEZON CITY",
                    "name": "Extra Extra MNL",
                    "owner": "Enzo Bonoan",
                    "address": "UNIT #313-O PALADOMA Bldg., KATIPUNAN AvAVEe., LOYOLA HEIGHTS, QC.",
                    "hours": "Breakfast to Lunch",
                    "contact": "(0917) 549 1559",
                    "tabTeam": "Miles Bonoan",
                    "coordinates": {x: 14.6389597, y: 121.0720668}
                },
                {
                    "tmpId": 4,
                    "area": "BAGUIO CITY",
                    "name": "Pines Wellness",
                    "owner": "Jeannete Co / Mil Team",
                    "address": "NO. 21 PINES STUDIO, LOWER SESSION RD., BAGUIO CITY",
                    "hours": "Mon-Fri 11AM-3PM / Sat-Sun 1pm-5pm",
                    "contact": " 0917-5066388",
                    "tabTeam": "Arlene Balangue",
                    "coordinates": {x: 16.413614, y: 120.593924}
                },
                {
                    "tmpId": 5,
                    "area": "BAGUIO CITY",
                    "name": "Wellness Revelation",
                    "owner": "Ma. Victoria Ereño",
                    "address": "4 SIAPNO RD., PACDAL, Baguio City",
                    "hours": "Mon-Sun 6AM-12NN",
                    "contact": "0998-889-5129",
                    "tabTeam": "Arnold Chummac",
                    "coordinates": {x: 16.4174571, y: 120.6122733}
                },
                {
                    "tmpId": 6,
                    "area": "CAMILING, TARLAC",
                    "name": "Cordero's Wellness Center / Active World Team",
                    "owner": "Marenelle Cordero",
                    "address": "LUNA ST., POB. H. CAMILING ARCADE, CAMILING, TARLAC",
                    "hours": "Mon-Sat 8am -10am",
                    "contact": "0995-234-7034",
                    "tabTeam": "Jeannete Co",
                    "coordinates": {x: 15.6854847, y: 120.4090437}
                },
                {
                    "tmpId": 7,
                    "area": "STA. IGNACIA, TARLAC",
                    "name": "Fatslim Wellness Center",
                    "owner": "Jorgette Eugenio / World Team",
                    "address": "N/A",
                    "hours": "Mon - Sat 6:30 am -10am",
                    "contact": "0933-861-1589 / 0995-611-1313",
                    "tabTeam": "Miles Bonoan",
                    "coordinates": {x: 15.6163466, y: 120.4343454}
                },
                {
                    "tmpId": 8,
                    "area": "BAGUIO CITY",
                    "name": "Healthy Cells Wellness Center",
                    "owner": "Arvin Ereño / World Team",
                    "address": "YMCA Bldg. 2nd flr. Rm 212",
                    "hours": "Mon-Fri 9am to 1 pm",
                    "contact": "0998-889-5128",
                    "tabTeam": "Arnold Chummac",
                    "coordinates": {x: 16.411002, y: 120.5976389}
                },
                {
                    "tmpId": 9,
                    "area": "MAKATI",
                    "name": "Herbalife Cityland Makati",
                    "owner": "Arlene Balangue, Cecile Garcia, Anne Dimaculangan",
                    "address": "Cityland 10 Tower 1, UG1, HV Dela Costa",
                    "hours": "7AM to 9AM, 1130AM - 130PM",
                    "contact": "09178901852 / 09173017983 / 09204550211",
                    "tabTeam": "Arlene Balangue and Cecile Garcia",
                    "coordinates": {x: 14.5605952, y: 121.014912}
                },
                {
                    "tmpId": 10,
                    "area": "CALAMABA, LAGUNA",
                    "name": "Fitness Collective Wellness Hub",
                    "owner": "Senen Escamos",
                    "address": "15 Lopez Jaena St. Poblacion, Calamba City, Laguna",
                    "hours": "Breakfast Mondays to Fridays 6:30-9am Saturdays 7-10am",
                    "contact": "09178368498",
                    "tabTeam": "Genalyn Nato",
                    "coordinates": {x: 14.3933921, y: 120.953395}
                },
                {
                    "tmpId": 11,
                    "area": "CALAMABA, LAGUNA",
                    "name": "Fit Alley Wellness Hub",
                    "owner": "Kriezl Ives Malenab",
                    "address": "Mary's Canteen 106 Ipil Ipil St., Bucal, Calamba, Laguna (In front of LETRAN)",
                    "hours": "Breakfast/Afternoon Mondays to Fridays 6:30-10am ; 4-7pm Saturdays 7-10am",
                    "contact": "09054993388",
                    "tabTeam": "Genalyn Nato",
                    "coordinates": {x: 14.1901109, y: 121.1620805}
                },
                {
                    "tmpId": 12,
                    "area": "LOS BANOS, LAGUNA",
                    "name": "Fit Ambitions Wellness Hub",
                    "owner": "Ela Rae Mangalindan",
                    "address": "Bong Auto Supply Bldg., National Highway Maahas, Los Baños, Laguna",
                    "hours": "Breakfast Mondays to Fridays 6:30-10am Saturdays 7-10am",
                    "contact": "09167866683",
                    "tabTeam": "Genalyn Nato",
                    "coordinates": {x: 14.1747757, y: 121.2168307}
                },
                {
                    "tmpId": 13,
                    "area": "LOS BANOS, LAGUNA",
                    "name": "FIT AND FREE WELLNESS HUB",
                    "owner": "Genalyn Nato / Charles Neil Nato",
                    "address": "2nd flr Monticello Bldg Halcon St. Cor. Diamond St Los Baños Subd Batong Malake Los Baños Laguna (Across Mercury Drugstore Agapita Branch) ",
                    "hours": "6:30-7AM Mondays-Fridays 7AM-10AM Saturdays",
                    "contact": "09985476228 / 09985476224",
                    "tabTeam": "Genalyn Nato",
                    "coordinates": {x: 14.1727877, y: 121.240622}
                },
                {
                    "tmpId": 14,
                    "area": "BINAKAYAN, KAWIT, CAVITE",
                    "name": "AEROBICS IN A BOTTLE WELLNESS HUB",
                    "owner": "ELIZABETH SARDIA",
                    "address": "162 Balsahan St. Binakayan, Kawit, Cavite ",
                    "hours": "Monday to Sat 7am to 9:30",
                    "contact": "09175100656 / 09493088720",
                    "tabTeam": "Thelma Lagrimas",
                    "coordinates": {x: 14.4499692, y: 120.922125}
                },
                {
                    "tmpId": 15,
                    "area": "Sta. Cruz, Laguna",
                    "name": "NutriAKTIV Hub",
                    "owner": "Maria Teresita Angelito Lobo",
                    "address": "82 P.Guevarra St. Pagsawitan, Sta. Cruz, Laguna, 2/f of Motolite across Save More Primark",
                    "hours": "Breakfast Mondays to Friday 6:30-10am Saturdays 7am - 10 am",
                    "contact": "09062106350/ 09267125398",
                    "tabTeam": "Genalyn Nato",
                    "coordinates": {x: 14.2856857, y: 121.411546}
                },
                {
                    "tmpId": 16,
                    "area": "Novaliches, Quezon City",
                    "name": "POSITIVE HEALTH WELLNESS HUB",
                    "owner": "Prem Lagrimas",
                    "address": "Villa Verde Subd. Gate ( Bayan entrance)Novaliches Quezon City. 7-Eleven & Andoks bldg. Ground flr.",
                    "hours": "Breakfast 6:30 am - 9:30 am",
                    "contact": "09278178383", 
                    "tabTeam": "Thelma Lagrimas",
                    "coordinates": {x: 14.7316773, y: 121.066689}
                },
                {
                    "tmpId": 17,
                    "area": "Manila",
                    "name": "NUTRI-POINT",
                    "owner": "Thelma & Rhenald Lagrimas",
                    "address": "Unit 137 Tower 2 Manila Res. Taft Ave. Malate Manila  ",
                    "hours": "Breakfast: 7 am- 10 am, Lunch : 11 am - 2 pm",
                    "contact": "09175321640 / 09088843978", 
                    "tabTeam": "MaryJane Tan",
                    "coordinates": {x: 14.5686021, y: 120.9800597}
                },
                {
                    "tmpId": 18,
                    "area": "Makati City",
                    "name": "Herbalife Makati Square",
                    "owner": "Irene Leorna / Arne",
                    "address": "2nd Floor Makati Square Arena, Makati Square, Pasong Tamo, Makati City",
                    "hours": "Lunch & Dinner",
                    "contact": "(0915) 8904689 Irene/ (0956) 5893822 Arne", 
                    "tabTeam": "Sheila Hada",
                    "coordinates": {x: 14.5525496, y: 121.0117455}
                },
                {
                    "tmpId": 19,
                    "area": "Camarin, North Caloocan",
                    "name": "NUTRI-POINT",
                    "owner": "Teresa/Gani Climaco",
                    "address": "#1479 Gumamela St. Area-A Brgy. 175 Camarin, Caloocan City",
                    "hours": "Regular Breakfast, Dinner By Appointment",
                    "contact": "(0925) 312 1848 /(0920) 217 6133", 
                    "tabTeam": "Arlene Balangue",
                    "coordinates": {x: 14.760344, y: 121.0431085}
                },
                {
                    "tmpId": 20,
                    "area": "Almar North Caloocan",
                    "name": "Herbalife Metrocor Almar",
                    "owner": "Gemmalyn Pellejera",
                    "address": "Blk 8 lot 51 dahlia st. Metrocor Home Almar",
                    "hours": "Breakfast & Dinner ",
                    "contact": "(0927) 738 8619 - Achi", 
                    "tabTeam": "Arlene Balangue",
                    "coordinates": {x: 14.7540435, y: 121.0613914}
                }
            ]
        }

        return srcJSON;
        let url = './assets/backup/locations.json';
        this.http.get(url).subscribe((data) => {
            this.srcJSONx = data;
        });
    }

    private addMarkers(): void {

        let testJSON = this.initSource();
        // let testJSON = this.srcJSONx;
        
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
                                        '<div class="content conent-address">' +
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
        let testJSON = this.initSource();
        // let testJSON = this.srcJSONx;
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