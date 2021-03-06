function [ X, P, R, A ] = BuildSpider( x_0, rot, U )
%Dado o centro da estrutura (x_0), os ângulos rotacão (rot) e a
%matriz U de posi��es das patas (posi��o da pata i = U(i,:)), retorna
%as coordenadas da estrutura rotacionada (X) e as coordenadas das
%articula��es de cada pata (ponto j da pata i: P(i,j, :)).

%Constantes
    d1 = 43.7865;
    d2 = 91.82;
    d = d1+ d2;
    d3 = 131.82;
    L = [49.716; 82.9; 144.448]; % (coxa, femur, tibia)

%Matrix de rota��o
    R = rotation_xyz(rot);

%Referenciais das patas sem rota��o
    x_P = zeros(6, 3);
    x_P(1,:) = [x_0(1) - d2; x_0(2) + d3; x_0(3)].';
    x_P(2,:) = [x_0(1) + d2; x_0(2) + d3; x_0(3)].';
    x_P(3,:) = [x_0(1) - d; x_0(2); x_0(3)].';
    x_P(4,:) = [x_0(1) + d; x_0(2); x_0(3)].';
    x_P(5,:) = [x_0(1) - d2; x_0(2) - d3; x_0(3)].';
    x_P(6,:) = [x_0(1) + d2; x_0(2) - d3; x_0(3)].';

%Referenciais ap�s rota��o
    x_Pr = zeros(6,3);
    for i=1:6
        temp = R*(x_P(i,:).' - x_0) + x_0;
        x_Pr(i, :) = temp.';
    end
    X = x_Pr;
    
    P = zeros(6,4,3);
    A = zeros(18,1);
    for i=1:6
        angles = IK_patte( x_0, i, x_P(i,:).', U(i,:).', rot); %% **** x_P = x_pp + x0, x_pp = leg coordinates in base frame
        A(3*i-2:3*i, 1) = angles;
        %Print
        %angles(1:3)
        s1 = x_P(i,:).' - x_0;
        s2 = [s1(1) + ((-1)^i)*L(1)*cos(angles(1)); s1(2) + ((-1)^i)*L(1)*sin(angles(1)); s1(3)];
        %Ponto 1
        p_i1 = U(i,:).';
        %Ponto 4
        p_i4 = x_Pr(i,:).';
        %Ponto 3
        p_i3 = x_0 + R*s2;
        %Ponto 2
        l1 = p_i3 - x_Pr(i,:).';
        p_i2 = p_i3 + (L(2)/norm(l1))*cos(angles(2))*l1 + L(2)*sin(angles(2))*R*[0;0;1];   
        P(i,1,:) = p_i1.';
        P(i,2,:) = p_i2.';
        P(i,3,:) = p_i3.';
        P(i,4,:) = p_i4.';
    end
end

