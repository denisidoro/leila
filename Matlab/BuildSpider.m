function [ X, P, R ] = BuildSpider( x_0, rot, U )
%Dado o centro da estrutura (x_0), os ângulos de Euler (rotação) e a
%matriz U de posições das patas (posição da pata i = U(i,:)), retorna
%as coordenadas da estrutura rotacionada (X) e as coordenadas das
%articulações de cada pata (ponto j da pata i: P(i,j, :)).

%Constantes
    d1 = 43.7865;
    d2 = 91.82;
    d = d1+ d2;
    d3 = 131.82;
    L = [49.716; 82.9; 144.448]; % (coxa, femur, tibia)

%Matrix de rotação
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
    x_P = zeros(6, 3);
    x_P(1,:) = [x_0(1) - d2; x_0(2) + d3; x_0(3)].';
    x_P(2,:) = [x_0(1) + d2; x_0(2) + d3; x_0(3)].';
    x_P(3,:) = [x_0(1) - d; x_0(2); x_0(3)].';
    x_P(4,:) = [x_0(1) + d; x_0(2); x_0(3)].';
    x_P(5,:) = [x_0(1) - d2; x_0(2) - d3; x_0(3)].';
    x_P(6,:) = [x_0(1) + d2; x_0(2) - d3; x_0(3)].';

%Referenciais após rotação
    x_Pr = zeros(6,3);
    for i=1:6
        temp = R*(x_P(i,:).' - x_0) + x_0;
        x_Pr(i, :) = temp.';
    end
    X = x_Pr;
    
    P = zeros(6,4,3);
    for i=1:6
        angles = IK_patte( x_0, i, x_P(i,:).', U(i,:).', L, rot);
        %Print
        angles(1:3)
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

