//#define MAX_METABALLS 1

varying vec2 UV;

uniform int MetaballCount;
uniform vec3 Colours[MAX_METABALLS];
uniform vec2 Positions[MAX_METABALLS];
uniform float Radii[MAX_METABALLS];
uniform float Threshold;
uniform vec3 BackgroundColour;


float evaluate(vec2 position) {
    float sum = 0.0;

    for (int i = 0; i < MetaballCount; i++) {
		sum += Radii[i] / distance(position, Positions[i]);
	}

	return sum;
}


void main() {
    float sum = 0.0;
    float biggest = -1.0;
    vec3 colour = Colours[0];

    for (int i = 0; i < MetaballCount; i++) {
        float part = Radii[i] / distance(UV, Positions[i]);
        if (part > biggest) {
            biggest = part;
            colour = Colours[i];
        }
        sum += part;
    }

    if (sum >= Threshold) {
        gl_FragColor = vec4(colour, 1.0);
    }
    else {
        gl_FragColor = vec4(BackgroundColour, 1.0);
    }

    // for (int i = 0; i < MetaballCount; i++) {
    //     if (distance(UV, Positions[i]) - Radii[i] < 0.0) {
    //         //gl_FragColor = vec4(UV.x, UV.y, 0.0, 1.0);
    //         gl_FragColor = vec4(Colours[i], 1.0);
    //         return;
    //     }
    // }

    // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}