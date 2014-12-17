function [ R ] = rotation_euler( ang )
c = ang(3);
C = [cos(c), sin(c), 0; -sin(c), cos(c), 0; 0, 0, 1];
clear c
b = ang(2);
B = [1, 0, 0; 0, cos(b), sin(b); 0, -sin(b), cos(b)];

clear b
a = ang(1);
A = [cos(a), sin(a), 0; -sin(a), cos(a),0; 0, 0, 1];

clear a
R = C*B*A;
end

