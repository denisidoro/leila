function [angles] = IK_araignee( x_0, i, x_P,u, L, ang)
%Entradas: 
%x_0 = Centro do referencial da aranha
%i = N�mero da pata
%x_P = Referencial da pata (sem rota��o)
%u = Ponto de contato desejado
%L = Coxa, femur, tibia (comprimentos)
%ang = �ngulos de Euler(rota��o)

%%%C�lculo da matrix de rota��o
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

%%%�ngulo hip (primeiro servo)
s_i1 = x_P - x_0;
l_i = x_0 + R*s_i1 - u;
%Resultado
alpha = atan(l_i(2)/l_i(1))+ang(3)+ang(1);
%alpha = atan(l_i(2)/l_i(1));

%%%Knee joint vector calculation
s_i2 = [s_i1(1) + ((-1)^i)*L(1)*cos(alpha);
        s_i1(2) + ((-1)^i)*L(1)*sin(alpha);
        s_i1(3)];

%%%Knee leg vector calculation
ll_i = x_0 + R*s_i2 - u; %l'_i

%%%Intermediate angles
div = ll_i(1)^2 + ll_i(2)^2;
div = div^(1/2);
p_i = atan(ll_i(3)/div); %interm. angle 1
%clear div
phi_i = asin((ll_i(3)-l_i(3))/L(1)); %interm. angle 2

%%%Solutions (beta and gama)
beta = (L(2)^2) + norm(ll_i)^2 - (L(3)^2);
beta = beta/(2*L(2)*norm(ll_i));
beta = acos(beta);
beta = beta - (p_i + phi_i);

gama = (L(2)^2)+(L(3)^2) - (norm(ll_i)^2);
gama = gama/(2*L(2)*L(3));
gama = acos(gama);
gama = pi - gama;

angles = [alpha; beta; gama; p_i; phi_i];
end

