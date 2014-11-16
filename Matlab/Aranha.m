clear all
close all
%%%% Definição da base

%Constantes
d1 = 43.7865;
d2 = 91.82;
d = d1+ d2;
d3 = 131.82;
L = [49.716; 82.9; 144.448]; % (coxa, femur, tibia)

%Centro da base
 x_0 = input('Centro da base: ');
%x_0 = [0;0;0];

%Matrix de rotação
rot = input('Angulos de rotação: ')
%rot = [0;0;0];

c = rot(3);
C = [cos(c), sin(c), 0; -sin(c), cos(c), 0; 0, 0, 1];
clear c
b = rot(2);
B = [1, 0, 0; 0, cos(b), sin(b); 0, -sin(b), cos(b)];
clear b
a = rot(1);
A = [cos(a), sin(a), 0; -sin(a), cos(a),0; 0, 0, 1];
clear a
R = C*B*A;

%Referenciais das patas sem rotação
x_P1 = [x_0(1) - d2; x_0(2) + d3; x_0(3)];
x_P2 = [x_0(1) + d2; x_0(2) + d3; x_0(3)];

x_P3 = [x_0(1) - d; x_0(2); x_0(3)];
x_P4 = [x_0(1) + d; x_0(2); x_0(3)];

x_P5 = [x_0(1) - d2; x_0(2) - d3; x_0(3)];
x_P6 = [x_0(1) + d2; x_0(2) - d3; x_0(3)];

%Referenciais após rotação
x_P1r = R*(x_P1 - x_0) + x_0;
x_P2r = R*(x_P2 - x_0) + x_0;

x_P3r = R*(x_P3 - x_0) + x_0;
x_P4r = R*(x_P4 - x_0) + x_0;

x_P5r = R*(x_P5 - x_0) + x_0;
x_P6r = R*(x_P6 - x_0) + x_0;


%%% Definição das patas

%Pontos de contato
u1 = [ - d2 - 50;  d3 + 40;  - 80];
u2 = [ + d2 + 50; d3 + 40; - 80];

u3 = [ - d - 50; 0; -80];
u4 = [ + d + 50; 0; -80];

u5 = [ - d2 - 50;  - d3 - 40;  - 80];
u6 = [ + d2 + 50;  - d3 - 40;  - 80];

%%%%% Pata 1 %%%%%%%%%%%%%%%%%%%%%%%%
angles1 = IK_araignee( x_0, 1, x_P1, u1, L, rot);

%Ponto 1
p11 = u1;

%Ponto 4
p14 = x_P1r;

%Ponto 3
s11 = x_P1 - x_0;
s12 = [s11(1) + (-1)*L(1)*cos(angles1(1)); s11(2) + (-1)*L(1)*sin(angles1(1)); s11(3)]; %Adaptar para as patas pares
p13 = x_0 + R*s12;

%Ponto 2
l11 = p13 - x_P1r;
p12 = p13 + (L(2)/norm(l11))*cos(angles1(2))*l11 + L(2)*sin(angles1(2))*R*[0;0;1];


%%%%% Pata 2 %%%%%%%%%%%%%%%%%%%%%%%%
angles2 = IK_araignee( x_0, 2, x_P2, u2, L, rot);

%Ponto 1
p21 = u2;

%Ponto 4
p24 = x_P2r;

%Ponto 3
s21 = x_P2 - x_0;
s22 = [s21(1) + (1)*L(1)*cos(angles2(1)); s21(2) + (1)*L(1)*sin(angles2(1)); s21(3)]; %Adaptar para as patas pares
p23 = x_0 + R*s22;

%Ponto 2
l21 = p23 - x_P2r;
p22 = p23 + (L(2)/norm(l21))*cos(angles2(2))*l21 + L(2)*sin(angles2(2))*R*[0;0;1];


%%%%% Pata 3 %%%%%%%%%%%%%%%%%%%%%%%%
angles3 = IK_araignee( x_0, 3, x_P3, u3, L, rot);

%Ponto 1
p31 = u3;

%Ponto 4
p34 = x_P3r;

%Ponto 3
s31 = x_P3 - x_0;
s32 = [s31(1) + (-1)*L(1)*cos(angles3(1)); s31(2) + (-1)*L(1)*sin(angles3(1)); s31(3)]; %Adaptar para as patas pares
p33 = x_0 + R*s32;

%Ponto 2
l31 = p33 - x_P3r;
p32 = p33 + (L(2)/norm(l31))*cos(angles3(2))*l31 + L(2)*sin(angles3(2))*R*[0;0;1];


%%%%% Pata 4 %%%%%%%%%%%%%%%%%%%%%%%%
angles4 = IK_araignee( x_0, 4, x_P4, u4, L, rot);

%Ponto 1
p41 = u4;

%Ponto 4
p44 = x_P4r;

%Ponto 3
s41 = x_P4 - x_0;
s42 = [s41(1) + (1)*L(1)*cos(angles4(1)); s41(2) + (1)*L(1)*sin(angles4(1)); s41(3)]; %Adaptar para as patas pares
p43 = x_0 + R*s42;

%Ponto 2
l41 = p43 - x_P4r;
p42 = p43 + (L(2)/norm(l41))*cos(angles4(2))*l41 + L(2)*sin(angles4(2))*R*[0;0;1];



%%%%% Pata 5 %%%%%%%%%%%%%%%%%%%%%%%%
angles5 = IK_araignee( x_0, 5, x_P5, u5, L, rot);

%Ponto 1
p51 = u5;

%Ponto 4
p54 = x_P5r;

%Ponto 3
s51 = x_P5 - x_0;
s52 = [s51(1) + (-1)*L(1)*cos(angles5(1)); s51(2) + (-1)*L(1)*sin(angles5(1)); s51(3)]; %Adaptar para as patas pares
p53 = x_0 + R*s52;

%Ponto 2
l51 = p53 - x_P5r;
p52 = p53 + (L(2)/norm(l51))*cos(angles4(2))*l51 + L(2)*sin(angles5(2))*R*[0;0;1];


%%%%% Pata 6 %%%%%%%%%%%%%%%%%%%%%%%%
angles6 = IK_araignee( x_0, 6, x_P6, u6, L, rot);

%Ponto 1
p61 = u6;

%Ponto 4
p64 = x_P6r;

%Ponto 3
s61 = x_P6 - x_0;
s62 = [s61(1) + (1)*L(1)*cos(angles6(1)); s61(2) + (1)*L(1)*sin(angles6(1)); s61(3)]; %Adaptar para as patas pares
p63 = x_0 + R*s62;

%Ponto 2
l61 = p63 - x_P6r;
p62 = p63 + (L(2)/norm(l61))*cos(angles6(2))*l61 + L(2)*sin(angles6(2))*R*[0;0;1];


%%%%%%%%%%%%%%  Plots %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
figure(1)

%%Plot estrutura
x = [x_P1r(1), x_P3r(1), x_P5r(1), x_P6r(1), x_P4r(1), x_P2r(1),x_P1r(1)];
y = [x_P1r(2), x_P3r(2), x_P5r(2), x_P6r(2), x_P4r(2), x_P2r(2),x_P1r(2)];
z = [x_P1r(3), x_P3r(3), x_P5r(3), x_P6r(3), x_P4r(3), x_P2r(3),x_P1r(3)];
xx = [x_P1r(1), x_P6r(1), x_P5r(1),x_P2r(1),x_P1r(1)];
yy = [x_P1r(2), x_P6r(2), x_P5r(2),x_P2r(2),x_P1r(2)];
zz = [x_P1r(3), x_P6r(3), x_P5r(3),x_P2r(3),x_P1r(3)];
hold on
plot3(x,y,z, '-o', 'Linewidth',5)
plot3(xx,yy,zz, 'r','Linewidth',5)
grid


%%Plot pata 1
product = dot(cross(l11, p12-p13), p11-p12)
x1 = [p11(1), p12(1), p13(1), p14(1)];
y1 = [p11(2), p12(2), p13(2), p14(2)];
z1 = [p11(3), p12(3), p13(3), p14(3)];
plot3(x1,y1,z1,'-og','Linewidth',5)

%%Plot pata 2
x2 = [p21(1), p22(1), p23(1), p24(1)];
y2 = [p21(2), p22(2), p23(2), p24(2)];
z2 = [p21(3), p22(3), p23(3), p24(3)];
plot3(x2,y2,z2,'-og','Linewidth',5)

%%Plot pata 3
x3 = [p31(1), p32(1), p33(1), p34(1)];
y3 = [p31(2), p32(2), p33(2), p34(2)];
z3 = [p31(3), p32(3), p33(3), p34(3)];
plot3(x3,y3,z3,'-og','Linewidth',5)

%%Plot pata 4
x4 = [p41(1), p42(1), p43(1), p44(1)];
y4 = [p41(2), p42(2), p43(2), p44(2)];
z4 = [p41(3), p42(3), p43(3), p44(3)];
plot3(x4,y4,z4,'-og','Linewidth',5)

%%Plot pata 5
x5 = [p51(1), p52(1), p53(1), p54(1)];
y5 = [p51(2), p52(2), p53(2), p54(2)];
z5 = [p51(3), p52(3), p53(3), p54(3)];
plot3(x5,y5,z5,'-og','Linewidth',5)

%%Plot pata 6
x6 = [p61(1), p62(1), p63(1), p64(1)];
y6 = [p61(2), p62(2), p63(2), p64(2)];
z6 = [p61(3), p62(3), p63(3), p64(3)];
plot3(x6,y6,z6,'-og','Linewidth',5)

%hold off
