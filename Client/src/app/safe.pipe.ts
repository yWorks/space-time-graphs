import { Pipe } from '@angular/core'
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeScript,
  SafeStyle,
  SafeUrl
} from '@angular/platform-browser'

/**
 * Allowing to render HTML in the output.
 */
@Pipe({
  name: 'safe'
})
export class SafePipe {
  constructor(protected _sanitizer: DomSanitizer) {}

  public transform(
    value: string,
    type: string = 'html'
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        return this._sanitizer.bypassSecurityTrustHtml(value)
      case 'style':
        return this._sanitizer.bypassSecurityTrustStyle(value)
      case 'script':
        return this._sanitizer.bypassSecurityTrustScript(value)
      case 'url':
        return this._sanitizer.bypassSecurityTrustUrl(value)
      case 'resourceUrl':
        return this._sanitizer.bypassSecurityTrustResourceUrl(value)
      default:
        throw new Error(`Invalid safe type specified: ${type}`)
    }
  }
}
