# Ionic QR code reader

This is a simple example project of a **mobile application** developed in **ionic and reactJS** that reads **QR codes**. 


# ionic

Ionic is an open source UI toolkit for building performant, high-quality mobile apps using web technologies — HTML, CSS, and JavaScript — with integrations for popular frameworks like [Angular](https://ionicframework.com/docs/angular/overview), [React](https://ionicframework.com/docs/react), and [Vue](https://ionicframework.com/docs/vue/overview).

## Reader Component

The main code of this example is located in [src/components/Reader.tsx](https://github.com/samack77/ionic-react-check-qr-example/blob/main/src/components/Reader.tsx) 
In this example we will use this library [@capacitor-community/barcode-scanner](https://github.com/capacitor-community/barcode-scanner)

### Some considerations:
1. Make sure you have the necessary permissions to read the QR. `didUserGrantPermission()`
2. The QR you need to generate to test this code is basically a valid user ID for this testing API https://reqres.in/ Example: `2`
<img width="265" alt="image" src="https://github.com/samack77/ionic-react-check-qr-example/assets/10253557/1e8cc9bc-546f-4f12-aa80-95f53c81fd26">

3. Consider these lines of code, which basically make the background of our app transparent to visualize the camera interface.
  ```
    BarcodeScanner.hideBackground();
    document.querySelector('body')?.classList.add('scanner-active');
    BarcodeScanner.showBackground();
	  document.querySelector('body')?.classList.remove('scanner-active');
	
    body.scanner-active {
	    --background: transparent;
	    --ion-background-color: transparent;
    }
    
    .hide {
	    display: none;
	    --background: transparent;
	    --ion-background-color: transparent;
    }
  ```

4. In some Android dark themes or dark mode, you may not be able to see the camera interface. 
