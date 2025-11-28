# Sistema IVR Escalable para Gestión de Llamadas

Este proyecto implementa un **IVR modular** utilizando **XState** para manejar máquinas de estado y **Asterisk ARI** para la gestión de llamadas telefónicas.  

El IVR actual está diseñado como un sistema escalable que permite:

- Navegación entre menús de varios departamentos.  
- Control de intentos limitados por menú.  
- Lectura de DTMF con timeout.  
- Reproducción de audio generado dinámicamente con **eSpeak**.  
- Integración con Asterisk ARI para contestar y colgar llamadas.

---

## 🎛 Máquina base (`withAttempts`)

La **máquina base** es el núcleo del sistema de menús. Su objetivo es:

- Proporcionar un control uniforme de **reintentos** para los menús.  
- Definir la lógica de **entrada de usuario** y transición de estados.  
- Servir como plantilla para todas las máquinas de departamento.

La máquina base permite que cada máquina de departamento defina sus propios estados y acciones sin tener que replicar la lógica de reintentos o de entrada de usuario.

## 🏢 Máquina principal y menús de los departamentos

El IVR está compuesto por varias máquinas de estado que representan los menús de cada departamento, todas ellas **heredan la lógica de la máquina base**, lo que garantiza control de reintentos, gestión de DTMF y transición segura de estados.

### Máquina principal

La máquina principal es el punto de entrada del IVR. Cuando un usuario llama, se le da la bienvenida y se le presenta el menú de departamentos:

- Para acceder a **Facturación**, el usuario marca `1`.  
- Para acceder a **RRHH**, el usuario marca `2`.

### Departamento RRHH

En RRHH, el usuario puede elegir entre:

- **Nómina**:  
  El sistema solicita el DNI (8 dígitos) mediante DTMF. A continuación, se realiza una consulta simulada a un API público (`getUser`) y se reproduce un mensaje con el nombre del usuario y una nómina simulada.

- **Contratación**:  
  El IVR reproduce un mensaje indicando que la solicitud será atendida y finaliza la llamada.

### Departamento Facturación

En Facturación, el usuario puede elegir entre:

- **Consultar facturas**:  
  Simulación de consulta de facturas mediante logs.  

- **Pagar facturas**:  
  Simulación de pago de facturas mediante logs.

---

En conjunto, la **máquina principal** coordina todos los departamentos y asegura que la navegación sea fluida, segura y consistente, mientras que cada máquina de departamento mantiene su lógica independiente y reutiliza las funcionalidades de la máquina base.

---

## 📞 Gestión de DTMF (`listenDtmf`)

La función `listenDtmf` permite capturar de manera controlada la entrada del usuario desde el teclado del teléfono durante la llamada. Es la forma en que el IVR sabe qué opción ha seleccionado el usuario y permite que las máquinas de estado reaccionen adecuadamente.

`listenDtmf` permite definir cuántos dígitos puede marcar el usuario y cuál carácter indica que ha terminado de introducir su respuesta, como por ejemplo `#`. Además, controla el tiempo máximo de espera para la entrada, de forma que si el usuario no responde dentro del período definido (por defecto 10 segundos), la llamada se cuelga automáticamente.

---

## 🔊 Texto a voz (TTS) con eSpeak

El IVR genera mensajes dinámicos usando **eSpeak**:

1. Se envía el texto al microservicio eSpeak mediante HTTP POST.  
2. Se genera un archivo de audio (`.wav`) en el servidor.  
3. Se reproduce el audio en la llamada mediante ARI.  
4. Opcionalmente, se puede colgar la llamada al terminar la reproducción.

**Función principal:**  
- `playTextAudio(channel, text, hangup = false)`

Esto permite reproducir mensajes dinámicos en cualquier estado de la máquina.

## 🛠 Funcionamiento general del IVR

Cuando llega una llamada:

1. Se responde automáticamente usando `answerChannel`.  
2. Se arranca la **máquina principal**, que representa el menú de selección de departamento.  
3. Según la opción seleccionada por el usuario (DTMF), se invoca la máquina correspondiente del departamento.  
4. Cada máquina de departamento puede ejecutar sub-menús, reproducir mensajes, solicitar datos o finalizar la llamada.  
5. Al finalizar una máquina de departamento, la llamada puede volver al menú principal o colgarse automáticamente.
