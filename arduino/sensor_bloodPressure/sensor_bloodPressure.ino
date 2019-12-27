#include <MySignals.h> //librería MySignals
#include "Wire.h"
#include "SPI.h"

void setup() //configuraciones iniciales
{
  Serial.begin(19200); //inicio de la comunicación serial
  MySignals.begin(); //inicializa la librería

  MySignals.initSensorUART(); //se inicializa comunicacion con el sensor
  MySignals.enableSensorUART(BLOODPRESSURE); // se habilita la comunicacion con el sensor
  //y se especifica de que tipo es
}

void loop() //lazo principal
{
  if (MySignals.getStatusBP()) //indica si el sensor de presión se encuentra conectado y encendido
  {
    delay(1000);
    Serial.println();
    if (MySignals.getBloodPressure() == 1) //indica si se ha recivido el dato de la medición
    {
      MySignals.disableMuxUART(); //deshabilita la comunicacion con el sensor
      
      Serial.println();      
      Serial.print(MySignals.bloodPressureData.systolic); // envío de presión sistólica
      Serial.print(",");
      Serial.print(MySignals.bloodPressureData.diastolic); // envío de presión diastólica
      Serial.print(",");
      Serial.println(MySignals.bloodPressureData.pulse); // envío del pulso
      MySignals.enableMuxUART(); // habilita de nuevo la comunicacion con el sensor
    }
  }
  delay(1000);
}





