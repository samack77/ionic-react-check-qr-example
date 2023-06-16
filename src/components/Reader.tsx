import { IonButton, IonIcon, IonLabel, useIonAlert } from '@ionic/react';
import './Reader.css';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { useCallback, useState } from 'react';
import { checkmarkCircleOutline, checkmarkCircleSharp, warningOutline, warningSharp } from 'ionicons/icons';
import axios from 'axios';
import { format } from 'date-fns';

interface User {
  id?: string;
  email?: string;
  first_name: string;
  last_name?: string;
  avatar?: string;
}

interface ValidationResult {
  user: User;
  validated: boolean;
  validationDate: string;
  valid: boolean;
}

const defaultData: ValidationResult = {
  user: {first_name: ''},
  validated: false,
  validationDate: '',
  valid: false
};

const Reader: React.FC = () => {

  const [presentAlert] = useIonAlert();

  const [userId, setUserId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({...defaultData});

  const prepare = () => {
    BarcodeScanner.prepare();
  };
  
  const displayAlert = (title: string, subTitle: string, message: string) => {
    presentAlert({
      header: title,
      subHeader: subTitle,
      message,
      buttons: ['OK'],
    });
  }

  const didUserGrantPermission = async () => {
    // check if user already granted permission
    const status = await BarcodeScanner.checkPermission({ force: false });

    if (status.granted) {
      // user granted permission
      return true;
    }

    if (status.denied) {
      // user denied permission
      const c = confirm('If you want to grant permission for using your camera, enable it in the app settings.');
      if (c) {
        await BarcodeScanner.openAppSettings();
      } else {
        return false;
      }
    }

    if (status.asked) {
      // system requested the user for permission during this call
      // only possible when force set to true
    }

    if (status.neverAsked) {
      // user has not been requested this permission before
      // it is advised to show the user some sort of prompt
      // this way you will not waste your only chance to ask for the permission
      const c = confirm('We need your permission to use your camera to be able to scan barcodes');
      if (!c) {
        return false;
      }
    }

    if (status.restricted || status.unknown) {
      // ios only
      // probably means the permission has been denied
      return false;
    }

    // user has not denied permission
    // but the user also has not yet granted the permission
    // so request it
    const statusRequest = await BarcodeScanner.checkPermission({ force: true });

    if (statusRequest.asked) {
      // system requested the user for permission during this call
      // only possible when force set to true
    }

    if (statusRequest.granted) {
      // the user did grant the permission now
      return true;
    }

    // user did not grant the permission, so he must have declined the request
    return false;
  };

  const checkData = async (userId: string, validate = false) => {
    try {
      const result = await axios.get(`https://reqres.in/api/users/${userId}?validate=${validate}`);
      const response = result.data;
      if (response.data) {
        const user = response.data;
          setValidationResult({
            user,
            validated: validate,
            validationDate: new Date().toISOString(),
            valid: true
          });
      } else {
        displayAlert('Error', 'Información no encontrada', 'No hemos encontrado información, verifique el QR e intente nuevamente.');
        setValidationResult({...defaultData, user: {first_name: 'Informacion no encontrada'}});
      }

    } catch (_) {
      displayAlert('Error', 'Intente nuevamente', 'Se ha presentado un error procesando su solicitud, por favor intente nuevamente.');
      setValidationResult({...defaultData, user: {first_name: 'Informacion no encontrada'}});
    }
  }

  const startScan = async () => {
    setValidationResult({...defaultData});
    BarcodeScanner.hideBackground();
    document.querySelector('body')?.classList.add('scanner-active');
    setScanning(true);
    const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });
    if (result.hasContent) {
      const userId = result.content;
      if (userId) {
        setUserId(userId);
        checkData(userId);
      } else {
        displayAlert('Error', 'QR no válido', 'Este QR parece no ser válido.')
        setValidationResult({...defaultData, user: {first_name: 'QR no admitido'}});
      }
    }
    stopScan();
  };

  const stopScan = () => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
    setScanning(false);
  };

  const readQR = useCallback(async () => {
    prepare();
    const permissionsResult = await didUserGrantPermission();
    if (permissionsResult) {
      startScan();
    } else {
      stopScan();
    }
  }, []);

  const validateUser = useCallback(async () => {
    checkData(userId, true);
  }, [userId]);

  return (
    <div id="container">
      <IonButton className={scanning ? 'hide' : ''} color="danger" expand="block" onClick={readQR}>
        Escanear QR
      </IonButton>

      {validationResult && validationResult.user.first_name.length > 0 && (
        <div>
          <h2>Resultado:</h2>
          <p><strong>Usuario: </strong><span>({validationResult.user.id}) {validationResult.user.first_name} {validationResult.user.last_name}</span></p>
          <p><strong>Email: </strong><span>{validationResult.user.email}</span></p>
          {!validationResult.validated && validationResult.valid && <>
            <IonIcon className='green-icon' size='large' aria-hidden="true" slot="start" ios={checkmarkCircleOutline} md={checkmarkCircleSharp} />
            <IonButton className={scanning ? 'hide' : ''} color="primary" expand="block" onClick={validateUser}>
              Validar Ingreso
            </IonButton></>
          }

          {validationResult.validated && validationResult.valid && (
            <>
              <IonIcon className='warning-icon' size='large' aria-hidden="true" slot="start" ios={warningOutline} md={warningSharp} />
              <IonLabel className='warning-text'>
                Este ingreso ya fue validado {validationResult.validationDate && validationResult.validationDate.length > 0 && 
                <strong>{format(new Date(validationResult.validationDate), 'h:mm a, dd-MM-yyyy')}</strong>
              }.</IonLabel>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reader;
