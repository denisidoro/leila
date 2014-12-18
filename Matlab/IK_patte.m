function [angles] = IK_patte( x_0, i, x_P,u, L, ang)
%Entradas: 
%x_0 = Centro do referencial da aranha
%i = N�mero da pata
%x_P = Referencial da pata (sem rota��o)
%u = Ponto de contato desejado
%L = Coxa, femur, tibia (comprimentos)
%ang = �ngulos de rota��o

%%%C�lculo da matrix de rota��o
R = rotation_xyz(ang);

%%%�ngulo hip (primeiro servo)
s_i1 = x_P - x_0;
l_i = x_0 + R*s_i1 - u;
%Resultado
alpha = atan(dot(l_i,R*[0;1;0])/dot(l_i,R*[1;0;0]));

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