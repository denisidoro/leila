function [ T ] = planLegParabola(i, u_i, u_f, x_0, rot, rot2, steps)
% i : leg number
%x_0 : Center of the base - Fixed frame
%rot : Euler angles (base)
%rot2 : Euler angles (movement frame)
%u_i : Initial contact point (fixed frame)
%u_f : Final contact point (fixed frame)
%steps : number of points - 1

%Constants
d1 = 43.7865;
d2 = 91.82;

d = d1 + d2;
d3 = 131.82;

%Constant vectors
x_P = zeros(6, 3); %Leg coordinates - Base frame
x_P(1,:) = [- d2; d3; 0].';
x_P(2,:) = [d2; d3; 0].';
x_P(3,:) = [d; 0; 0].';
x_P(4,:) = [d; 0; 0].';
x_P(5,:) = [- d2; - d3; 0].';
x_P(6,:) = [d2; - d3; 0].';

%Rotation matrices
R = rotation_euler(rot);
RR = rotation_euler(rot2);


%%%Change of coordinates: fixed frame -> movement frame
x_p = (x_P(i,:).') + x_0; %Verify *******
s = x_p - x_0; %redundante*******
l = x_0 + R*s - u_i;

x_pmov = [1;0;0]*dot(l, RR*[1;0;0]) + [0;1;0]*dot(l, RR*[0;1;0]);

u_i_mov = (RR^-1)*(u_i-x_pmov);
u_f_mov = (RR^-1)*(u_f-x_pmov);


%%% Idea 1: x = f(y) / z = g(y)
ui = u_i_mov;
uf = u_f_mov;


s = (uf(2)-ui(2))/steps;
y = ui(2):s:uf(2);

% f = ay² + by + c
ym = (uf(2) + ui(2))/2;
dif = abs(uf(2) - ui(2));
A = [ui(2)^2, ui(2), 1; uf(2)^2, uf(2), 1; ym^2, ym, 1];
K = A\[ui(1); uf(1); ui(1) + ((-1)^i)*dif/10]; % K = [a; b; c]
x = K(1).*(y.^2) + K(2).*y + K(3);


% g = ly² + my + n
ym = (uf(2) + ui(2))/2;
dif = abs(uf(2) - ui(2));
A = [ui(2)^2, ui(2), 1; uf(2)^2, uf(2), 1; ym^2, ym, 1];
K = A\[ui(3); uf(3); ui(3) + dif/3]; % K = [l; m; n]
z = K(1).*(y.^2) + K(2).*y + K(3);

%plot3(x,y,z)

%%Trajectory matrix (T)

T = [x; y; z]; %In the movement frame

%Change of coordinates
for i=1:steps+1
   T(:,i) = RR*T(:,i) + x_pmov;
end

end

