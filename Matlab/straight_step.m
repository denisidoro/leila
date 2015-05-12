function [ A, x_f, Uf] = straight_step(delta_x, x_0, delta_u, Ui, r_i, r_f, group, n_intervals)
% Inputs:
% delta_x: displacement of the base (vector)
% x_0: initial position of the base
% delta_u: displacement of the leg tips
% Ui: initial position of the leg tips
% r_i : initial rotation of the base
% r_f : final rotation of the base 
% group: group 0 = legs {1,4,5}, group 1 = legs {2, 3, 6} (change in
% javascrip)
% n_intervals = (number of points - 1) of the trajectory

%Outputs:
% A : matrix (18 x n_intervals+1) containing the angles of each point
% x_f : final position of the base 
% Uf : final position of the leg tips


%Constants
d1 = 43.7865;
d2 = 91.82;

d = d1+ d2;
d3 = 131.82;

%Leg coordinates in base frame
x_P = zeros(6, 3);
x_P(1,:) = [- d2; d3; 0].';
x_P(2,:) = [d2; d3; 0].';
x_P(3,:) = [- d; 0; 0].';
x_P(4,:) = [d; 0; 0].';
x_P(5,:) = [- d2; - d3; 0].';
x_P(6,:) = [d2; - d3; 0].';

A = zeros(18, n_intervals+1);
Uf = zeros(6,3);

% "Trajectory" of rotation angles and trajectory of the center
r = zeros(3, n_intervals+1);
x = zeros(3, n_intervals+1);
r(:,1) = r_i;
x(:,1) = x_0;
x_f = x_0 + delta_x;
for i=1:n_intervals+1
    r(:,i+1) = r_i + i*(r_f-r_i)./(n_intervals+1);
    x(:,i+1) = x_0 + i*(x_f-x_0)./(n_intervals+1);
end

if group == 0
%%%Move {1,4,5}
    Uf(1,:) = Ui(1,:) + delta_u.';
    Uf(4,:) = Ui(4,:) + delta_u.';
    Uf(5,:) = Ui(5,:) + delta_u.';

    Uf(2,:) = Ui(2,:);
    Uf(3,:) = Ui(3,:);
    Uf(6,:) = Ui(6,:);

    T1 = planLegParabola(1, Ui(1,:).', Uf(1,:).', x_0, r_i, [0;0;r_i(3)], n_intervals);
    T4 = planLegParabola(4, Ui(4,:).', Uf(4,:).', x_0, r_i, [0;0;r_i(3)], n_intervals);
    T5 = planLegParabola(5, Ui(5,:).', Uf(5,:).', x_0, r_i, [0;0;r_i(3)], n_intervals);
    
    for i=1:n_intervals+1
       angles1 = IK_patte( x(:,i), 1, x(:,i) + x_P(1,:).', T1(:,i), r(:,i));
       angles4 = IK_patte( x(:,i), 4, x(:,i) + x_P(4,:).', T4(:,i), r(:,i));
       angles5 = IK_patte( x(:,i), 5, x(:,i) + x_P(5,:).', T5(:,i), r(:,i));
       A(1:3,i) = angles1;
       A(10:12,i) = angles4;
       A(13:15, i) = angles5;      
       
       
       angles2 = IK_patte( x(:,i), 2, x(:,i) + x_P(2,:).', Ui(2,:).', r(:,i));    
       angles3 = IK_patte( x(:,i), 3, x(:,i) + x_P(3,:).', Ui(3,:).', r(:,i));
       angles6 = IK_patte( x(:,i), 6, x(:,i) + x_P(6,:).', Ui(6,:).', r(:,i));
       A(4:6,i) = angles2;
       A(7:9,i) = angles3;
       A(16:18,i) = angles6;       
    end

else
 %%%Move {2,3,6}
    Uf(2,:) = Ui(2,:) + delta_u.';
    Uf(3,:) = Ui(3,:) + delta_u.';
    Uf(6,:) = Ui(6,:) + delta_u.';

    Uf(1,:) = Ui(1,:);
    Uf(4,:) = Ui(4,:);
    Uf(5,:) = Ui(5,:);

    T2 = planLegParabola(2, Ui(2,:).', Uf(2,:).', x_0, r_i, [0;0;r_i(3)], n_intervals);
    T3 = planLegParabola(3, Ui(3,:).', Uf(3,:).', x_0, r_i, [0;0;r_i(3)], n_intervals);
    T6 = planLegParabola(6, Ui(6,:).', Uf(6,:).', x_0, r_i, [0;0;r_i(3)], n_intervals);
    
    for i=1:n_intervals+1
       angles2 = IK_patte( x(:,i), 2, x(:,i) + x_P(2,:).', T2(:,i), r(:,i));
       angles3 = IK_patte( x(:,i), 3, x(:,i) + x_P(3,:).', T3(:,i), r(:,i));
       angles6 = IK_patte( x(:,i), 6, x(:,i) + x_P(6,:).', T6(:,i), r(:,i));
       A(4:6,i) = angles2;
       A(7:9,i) = angles3;
       A(16:18, i) = angles6;      
       
       
       angles1 = IK_patte( x(:,i), 1, x(:,i) + x_P(1,:).', Ui(1,:).', r(:,i));    
       angles4 = IK_patte( x(:,i), 4, x(:,i) + x_P(4,:).', Ui(4,:).', r(:,i));
       angles5 = IK_patte( x(:,i), 5, x(:,i) + x_P(5,:).', Ui(5,:).', r(:,i));
       A(1:3,i) = angles1;
       A(10:12,i) = angles4;
       A(13:15,i) = angles5;       
    end
    
end
end

