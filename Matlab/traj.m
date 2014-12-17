%clear all
%close all

d1 = 43.7865;
d2 = 91.82;

d = d1+ d2;
d3 = 131.82;

x_0 = [0;0;0];
rot = [0;0;pi/6];
R = eye(3);
RR = eye(3);

%Pontos de contato iniciais
U = zeros(6,3);
U(1,:) = [x_0(1) - d2 - 100; x_0(2) + d3 + 50; x_0(3)-80].';
U(2,:) = [x_0(1) + d2 + 100; x_0(2) + d3 + 50; x_0(3)-80].';
U(3,:) = [x_0(1) - d - 100; x_0(2); x_0(3) - 80].';
U(4,:) = [x_0(1) + d + 100; x_0(2); x_0(3) - 80].';
U(5,:) = [x_0(1) - d2 - 100; x_0(2) - d3 - 50; x_0(3) - 80].';
U(6,:) = [x_0(1) + d2 + 100; x_0(2) - d3 - 50; x_0(3) - 80].';

%Pontos de contato (final e inicial):
u1i = U(1,:).';
u1f = [x_0(1) - d2 - 100; x_0(2) + d3 + 150; x_0(3)-80];
%Referencial pata e movimento:
xp1 = [- d2; + d3; 0];
xmov = [0;0;-80];

%Passando para referencial do movimento:
u1i_base = fixed_to_base(u1i, x_0, R);
u1f_base = fixed_to_base(u1f, x_0, R);

u1i_leg = base_to_leg( u1i_base, xp1);
u1f_leg = base_to_leg( u1f_base, xp1 );

u1i_mov = leg_to_mov(u1i_leg, xmov, RR);
u1f_mov = leg_to_mov(u1f_leg, xmov, RR);

%%% Ideia 1: x = f(y) / z = g(y)
ui = u1i_mov;
uf = u1f_mov;

steps = 10; %número de pontos
s = (uf(2)-ui(2))/steps;
y = ui(2):s:uf(2);

% f = ax² + by + c
ym = (uf(2) + ui(2))/2;
dif = uf(2) - ui(2);
A = [ui(2)^2, ui(2), 1; uf(2)^2, uf(2), 1; ym^2, ym, 1];
K = A\[ui(1); uf(1); ui(1) - dif/8]; % K = [a; b; c]
x = K(1).*(y.^2) + K(2).*y + K(3);

%hold on
%plot(x,y)
%axis([-300, -150, 150, 300])

% g = lx² + my + n
ym = (uf(2) + ui(2))/2;
dif = uf(2) - ui(2);
A = [ui(2)^2, ui(2), 1; uf(2)^2, uf(2), 1; ym^2, ym, 1];
K = A\[ui(3); uf(3); ui(3) + dif/5]; % K = [l; m; n]
z = K(1).*(y.^2) + K(2).*y + K(3);
plot3(x,y,z)
%axis([-300, -150, 150, 300])







