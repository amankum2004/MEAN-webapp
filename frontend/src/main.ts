import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Register Syncfusion license (remove in production or add your license key)
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense('YOUR_LICENSE_KEY'); // Get from https://www.syncfusion.com/account/licenses

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));