import { NgModule } from '@angular/core';
import { GoogleMapsComponent } from './google-maps/google-maps';
import { FaIconComponent } from './fa-icon/fa-icon';
@NgModule({
	declarations: [GoogleMapsComponent,
    FaIconComponent],
	imports: [],
	exports: [GoogleMapsComponent,
    FaIconComponent]
})
export class ComponentsModule {}
