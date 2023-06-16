import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Page.css';
import Reader from '../components/Reader';

const Page: React.FC = () => {

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Leer QR</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Leer QR</IonTitle>
          </IonToolbar>
        </IonHeader>
        <Reader />
      </IonContent>
    </IonPage>
  );
};

export default Page;
