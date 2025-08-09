from pyfirmata import Arduino, util
import time
import serial.tools.list_ports

# Automatically detect Arduino port
def find_arduino_port():
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if 'Arduino' in port.description or 'USB' in port.description:
            return port.device
    return None

# Find and initialize the board
ARDUINO_PORT = find_arduino_port()

if ARDUINO_PORT:
    board = Arduino(ARDUINO_PORT)
    LED_PIN = board.get_pin('d:13:o')  # digital pin 13 as output
    TEMP_SENSOR_PIN = 0  # A0 for LM35
    SOIL_SENSOR_PIN = 1  # A1 for Soil Moisture

    # Start iterator to read analog values
    it = util.Iterator(board)
    it.start()
    board.analog[TEMP_SENSOR_PIN].enable_reporting()
    board.analog[SOIL_SENSOR_PIN].enable_reporting()
    print(f" Arduino connected on {ARDUINO_PORT}")
else:
    board = None
    LED_PIN = None
    TEMP_SENSOR_PIN = None
    SOIL_SENSOR_PIN = None
    print(" Arduino not connected Running in safe mode.")

# Turn ON LED
def turn_on_led():
    if LED_PIN:
        LED_PIN.write(1)
        print("LED turned ON")
    else:
        print(" LED_PIN not initialized")

# Turn OFF LED
def turn_off_led():
    if LED_PIN:
        LED_PIN.write(0)
        print("LED turned OFF")
    else:
        print(" LED_PIN not initialized")

# Blink LED
def blink_led(times=3, delay=0.5):
    if LED_PIN:
        print(f" Blinking LED {times} times")
        for _ in range(times):
            LED_PIN.write(1)
            time.sleep(delay)
            LED_PIN.write(0)
            time.sleep(delay)
    else:
        print(" LED_PIN not initialized")

# Read temperature from LM35
def read_temperature():
    if board:
        value = board.analog[TEMP_SENSOR_PIN].read()
        if value is not None:
            voltage = value * 5.0
            temperature_c = voltage * 100
            print(f" Room Temperature: {temperature_c:.2f}°C")
            return round(temperature_c, 2)
        else:
            print(" Sensor value not ready yet")
            return None
    else:
        print(" Arduino board not initialized")
        return None
# Read soil moisture from sensor
def read_soil_moisture():
    if board:
        value = board.analog[SOIL_SENSOR_PIN].read()
        if value is not None:
            percentage = (1 - value) * 100  # Dry:1.0 → 0%, Wet:0.0 → 100%
            print(f" Soil Moisture: {percentage:.2f}%")
            return round(percentage, 2)
        else:
            print(" Soil moisture sensor not ready")
            return None
    else:
        print(" Arduino board not initialized")
        return None
# Cleanup
def cleanup():
    if board and LED_PIN:
        LED_PIN.write(0)
        board.exit()
        print(" Arduino cleaned up")
    else:
        print("Nothing to clean up")

# Main running the code
# if __name__ == "__main__":
#     try:
#         while True:
#             read_temperature()
#             time.sleep(2)
#     except KeyboardInterrupt:
#         cleanup()
