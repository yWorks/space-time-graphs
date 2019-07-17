import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'
import { License } from 'yfiles'

if (environment.production) {
  enableProdMode()
}

/* Some color codes that are used in the application
Base blue: #6dcae6 (109, 202, 230)
Dark blue: #61859d (97, 133, 157)
Dark gray: #4d4f54
Light gray: #70757d
Highlight1: #f26522 (orange)
Highlight2: #00ae24 (green)
*/

// Load yFiles License
fetch('./assets/license.json')
  .then(response => {
    return response.json()
  })
  .then(license => {
    License.value = license;
    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch(err => console.log(err))
  });
