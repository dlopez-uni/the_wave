void setup() {
  Serial.begin(9600);
  // Preparamos los pines comunes del kit Cirkids
  for(int i=2; i<=13; i++) {
    pinMode(i, OUTPUT);
    digitalWrite(i, LOW);
  }
}

void loop() {
  if (Serial.available() >= 3) {
    char action = Serial.read(); // 'H' (High) o 'L' (Low)
    int pin = Serial.parseInt(); // Número del pin
    
    if (action == 'H') {
      digitalWrite(pin, HIGH);
    } else if (action == 'L') {
      digitalWrite(pin, LOW);
    }
  }
}
