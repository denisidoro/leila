function [ R ] = rotation_xyz( angles )
% R = Rx * Ry * Rz
a = angles(1);
b = angles(2);
c = angles(3);

Rx = [1, 0, 0; 0, cos(a), -sin(a); 0, sin(a), cos(a)];

Ry = [cos(b), 0, sin(b); 0, 1, 0; -sin(b), 0 ,cos(b)];

Rz = [cos(c), -sin(c), 0; sin(c), cos(c), 0; 0, 0, 1];

R = Rx*Ry*Rz;
end

