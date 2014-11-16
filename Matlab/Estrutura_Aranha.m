clear all
%%%Estrutura
%w1 = input('Largura da estrutura: ');
%w2 = input('Comprimento da estrutura: ');
%x_0 = input('Centro do referencial da estrutura: ');
%rot = input('Ângulos de Euler(rotação): ');
%L = input('Coxa, femur, tibia (comprimentos): ');

w1 = 8;
w2 = 16;
x_0 = [0;0;0];
rot = [0;0;0];
%rot = [0.2;0.2;0.3];
L = [4;5;12];


%Referenciais das patas sem rotação
x_P1 = [x_0(1) - w1/2; x_0(2) + w2/2; x_0(3)];
x_P2 = [x_0(1) + w1/2; x_0(2) + w2/2; x_0(3)];

x_P3 = [x_0(1) - w1/2; x_0(2); x_0(3)];
x_P4 = [x_0(1) + w1/2; x_0(2); x_0(3)];

x_P5 = [x_0(1) - w1/2; x_0(2) - w2/2; x_0(3)];
x_P6 = [x_0(1) + w1/2; x_0(2) - w2/2; x_0(3)];

%Matriz de rotação
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

%Após rotação:
x_P1r = R*(x_P1 - x_0) + x_0;
x_P2r = R*(x_P2 - x_0) + x_0;

x_P3r = R*(x_P3 - x_0) + x_0;
x_P4r = R*(x_P4 - x_0) + x_0;

x_P5r = R*(x_P5 - x_0) + x_0;
x_P6r = R*(x_P6 - x_0) + x_0;

%%%Pata 1
%u1 = input('Ponto de contato - Pata 1: ');
u1 = [-10;5;-9];
angles1 = IK_araignee( x_0, 1, x_P1, u1, L, rot);

%Ponto 1
p11 = u1;

%Ponto 3
s11 = x_P1 - x_0;
s12 = [s11(1) + (-1)*L(1)*cos(angles1(1)); s11(2) + (-1)*L(1)*sin(angles1(1)); s11(3)]; %Adaptar para as patas pares
%l11 = R*(s12-s11);
%p31 = x_P1r + l11;
p31 = x_0 + R*s12;
l11 = p31 - x_P1r;

%Ponto 2
p21 = p31 + (L(2)/norm(l11))*cos(angles1(2))*l11 + L(2)*sin(angles1(2))*R*[0;0;1];



%Ponto 4
p41 = x_P1r;

%%%Plot estrutura
x = [x_P1r(1), x_P3r(1), x_P5r(1), x_P6r(1), x_P4r(1), x_P2r(1),x_P1r(1)];
y = [x_P1r(2), x_P3r(2), x_P5r(2), x_P6r(2), x_P4r(2), x_P2r(2),x_P1r(2)];
z = [x_P1r(3), x_P3r(3), x_P5r(3), x_P6r(3), x_P4r(3), x_P2r(3),x_P1r(3)];
plot3(x,y,z,'Linewidth',5)
hold on

%%%Plot pata 1
x1 = [p11(1), p21(1), p31(1), p41(1)];
y1 = [p11(2), p21(2), p31(2), p41(2)];
z1 = [p11(3), p21(3), p31(3), p41(3)];
plot3(x1,y1,z1,'g','Linewidth',5)
grid
hold off

product = dot(cross(l11, p21-p31), p11-p21)

normal = cross(R*[0;0;1], l11);

prod_v2 = dot(normal, p31-p41)
prod_v3 = dot(normal, p21-p31)
prod_v4 = dot(normal, p11-p41)






