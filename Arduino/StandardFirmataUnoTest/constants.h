// Body (not used for the moment)
#define CoxaLength			50		// in mm, 49.716mm
#define FemurLength			83		// in mm, 82.9mm
#define TibiaLength			144		// in mm, 144.448mm

// IO pins (not used for the moment)
#define AX12Pin				2
#define LedPin				13

// Firmata
#define GENERIC_RESPONSE	0x60
#define MOVE_AX12			0xA0
#define MOVERW_AX12			0xA1
#define ACTION_AX12			0xA2
#define G_MOVING_AX12		0xB0
#define G_POSITION_AX12		0xB1
#define G_SPEED_AX12		0xB2
#define G_LOAD_AX12			0xB3
#define LED_BLINK_TEST		0x80
#define RESPONSE_TEST		0x81
