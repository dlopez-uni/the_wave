void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);
}

void loop() {
  digitalWrite(13, HIGH);
}
