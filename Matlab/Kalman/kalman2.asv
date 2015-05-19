clear all
%close all
%clc

dt = 0.001;
T = 10;
t = 0:dt:T;

var_kine = 0.005;
var_servo = 0.005;

r0 = [0; 0; 0];
v0 = [0; 0; 0];
q0 = [0; 0; 0 ; 1];
p10 = [-0.140; -0.0525; -0.110];
p20 = [-0.140; 0; -0.110];
p30 = [-0.140; 0.0525; -0.110];
p40 = [0.140; 0.0525; -0.110];
p50 = [0.140; 0; -0.110];
p60 = [0.140; -0.0525; -0.110];
bf0 = [0; 0; 0];
bw0 = [0; 0; 0];



% % posição das patas para teste de translação
 
Qp_ground = 0.00001*eye(3);
Qp_air = 1e3*eye(3);



% sobe pata
for i = 1:500
    r(:,i) = [0;0;0];
    p1(:,i) = [-0.140; -0.0525; -0.110+(dt*(i-1)*0.1)];
    p2(:,i) = [-0.140; 0; -0.110];
    p3(:,i) = [-0.140; 0.0525; -0.110+(dt*(i-1)*0.1)];
    p4(:,i) = [0.140; 0.0525; -0.110];
    p5(:,i) = [0.140; 0; -0.110+(dt*(i-1)*0.1)];
    p6(:,i) = [0.140; -0.0525; -0.110];
    Qp1(:, :, i) = Qp_air;
    Qp2(:, :, i) = Qp_ground;
    Qp3(:, :, i) = Qp_air;
    Qp4(:, :, i) = Qp_ground;
    Qp5(:, :, i) = Qp_air;
    Qp6(:, :, i) = Qp_ground;
end

Qp1(:, :, 1) = Qp_ground;
Qp3(:, :, 1) = Qp_ground;
Qp5(:, :, 1) = Qp_ground;
%acelera pata no y
for i = 501:801
    r(:,i) = [0; 1/4*(dt*(i-501))^2; 0];
    p1(:,i) = [-0.140; -0.0525+1/2*(dt*(i-501))^2; -0.110+(dt*(500)*0.1)];
    p2(:,i) = [-0.140; 0; -0.110];
    p3(:,i) = [-0.140; 0.0525+1/2*(dt*(i-501))^2; -0.110+(dt*(500)*0.1)];
    p4(:,i) = [0.140; 0.0525; -0.110];
    p5(:,i) = [0.140; 0+1/2*(dt*(i-501))^2; -0.110+(dt*(500)*0.1)];
    p6(:,i) = [0.140; -0.0525; -0.110];
    Qp1(:, :, i) = Qp_air;
    Qp2(:, :, i) = Qp_ground;
    Qp3(:, :, i) = Qp_air;
    Qp4(:, :, i) = Qp_ground;
    Qp5(:, :, i) = Qp_air;
    Qp6(:, :, i) = Qp_ground;
end

%velocidade constante no y
for i = 802:1201
    r(:,i) = [0; r(2,801)+ 0.15*(dt*(i-801));0];
    p1(:,i) = [-0.140; p1(2, 801) + 0.3*(dt*(i-801)); -0.110+(dt*(500)*0.1)];
    p2(:,i) = [-0.140; 0; -0.110];
    p3(:,i) = [-0.140; p3(2, 801) + 0.3*(dt*(i-801)); -0.110+(dt*(500)*0.1)];
    p4(:,i) = [0.140; 0.0525; -0.110];
    p5(:,i) = [0.140; p5(2, 801) + 0.3*(dt*(i-801)); -0.110+(dt*(500)*0.1)];
    p6(:,i) = [0.140; -0.0525; -0.110];
    Qp1(:, :, i) = Qp_air;
    Qp2(:, :, i) = Qp_ground;
    Qp3(:, :, i) = Qp_air;
    Qp4(:, :, i) = Qp_ground;
    Qp5(:, :, i) = Qp_air;
    Qp6(:, :, i) = Qp_ground;
end

% desacelera no  y
for i = 1202:1501
    r(:,i) = [0; r(2,1201) + 0.15*(dt*(i-1201)) - 1/4*(dt*(i-1201))^2; 0];
    p1(:,i) = [-0.140; p1(2, 1201)  + 0.3*(dt*(i-1201)) - 1/2*(dt*(i-1201))^2; -0.110+(dt*(500)*0.1)];
    p2(:,i) = [-0.140; 0; -0.110];
    p3(:,i) = [-0.140; p3(2, 1201)  + 0.3*(dt*(i-1201)) - 1/2*(dt*(i-1201))^2; -0.110+(dt*(500)*0.1)];
    p4(:,i) = [0.140; 0.0525; -0.110];
    p5(:,i) = [0.140; p5(2, 1201)  + 0.3*(dt*(i-1201)) - 1/2*(dt*(i-1201))^2; -0.110+(dt*(500)*0.1)];
    p6(:,i) = [0.140; -0.0525; -0.110];
    Qp1(:, :, i) = Qp_air;
    Qp2(:, :, i) = Qp_ground;
    Qp3(:, :, i) = Qp_air;
    Qp4(:, :, i) = Qp_ground;
    Qp5(:, :, i) = Qp_air;
    Qp6(:, :, i) = Qp_ground;
end

%desce pata
for i = 1502:2001
    r(:,i) = r(:, 1501);
    p1(:,i) = [-0.140; p1(2, 1501); -0.110+(dt*(500)*0.1)-(dt*(i-1501)*0.1)];
    p2(:,i) = [-0.140; 0; -0.110];
    p3(:,i) = [-0.140; p3(2, 1501); -0.110+(dt*(500)*0.1)-(dt*(i-1501)*0.1)];
    p4(:,i) = [0.140; 0.0525; -0.110];
    p5(:,i) = [0.140; p5(2, 1501); -0.110+(dt*(500)*0.1)-(dt*(i-1501)*0.1)];
    p6(:,i) = [0.140; -0.0525; -0.110];
    Qp1(:, :, i) = Qp_air;
    Qp2(:, :, i) = Qp_ground;
    Qp3(:, :, i) = Qp_air;
    Qp4(:, :, i) = Qp_ground;
    Qp5(:, :, i) = Qp_air;
    Qp6(:, :, i) = Qp_ground;
end
Qp1(:, :, 201) = Qp_ground;
Qp2(:, :, 201) = Qp_ground;
Qp5(:, :, 201) = Qp_ground;

for i = 2002:10000
    r(:,i) = r(:,1501);
    p1(:,i) = p1(:, 2001);
    p2(:,i) = p2(:, 2001);
    p3(:,i) = p3(:, 2001);
    p4(:,i) = p4(:, 2001);
    p5(:,i) = p5(:, 2001);
    p6(:,i) = p6(:, 2001);
    Qp1(:, :, i) = Qp_ground;
    Qp2(:, :, i) = Qp_ground;
    Qp3(:, :, i) = Qp_ground;
    Qp4(:, :, i) = Qp_ground;
    Qp5(:, :, i) = Qp_ground;
    Qp6(:, :, i) = Qp_ground;
end
% figure
% plot(t(1:length(t)-1), r(2, :))
% grid
% legend('r')
% figure
% plot(t(1:length(t)-1), p6(1, :))
% grid
% legend('x')
% figure
% plot(t(1:length(t)-1), p1(2, :))
% grid
% legend('y')
% figure
% plot(t(1:length(t)-1), p6(3, :))
% grid
% legend('z')

for i = 1:10000
    kin(1:3, i) = p1(:, i) - r(:, i);
    kin(4:6, i) = p2(:, i) - r(:, i);
    kin(7:9, i) = p3(:, i) - r(:, i);
    kin(10:12, i) = p4(:, i) - r(:, i);
    kin(13:15, i) = p5(:, i) - r(:, i);
    kin(16:18, i) = p6(:, i) - r(:, i);
end

% figure
% plot(t(1:length(t)-1), kin(1, :))
% grid
% legend('x')
% figure
% plot(t(1:length(t)-1), kin(2, :))
% grid
% legend('y')
% figure
% plot(t(1:length(t)-1), kin(3, :))
% grid
% legend('z')

% Teste rotação

% kin = zeros(18,1);
% for i = 1:501
%     angle = pi/3000*(i-1);
%     R = rotation_xyz([angle; 0; 0]);
%     kin(1:3, i) = R'*p10;
%     kin(4:6, i) = R'*p20;
%     kin(7:9, i) = R'*p30;
%     kin(10:12, i) = R'*p40;
%     kin(13:15, i) = R'*p50;
%     kin(16:18, i) = R'*p60;
%     Qp1(:, :, i) = Qp_ground;
%     Qp2(:, :, i) = Qp_ground;
%     Qp3(:, :, i) = Qp_ground;
%     Qp4(:, :, i) = Qp_ground;
%     Qp5(:, :, i) = Qp_ground;
%     Qp6(:, :, i) = Qp_ground;
% end
% for i = 502:1001
%     angle = pi/3000*(1000 - (i-1));
%     R = rotation_xyz([angle; 0; 0]);
%     kin(1:3, i) = R'*p10;
%     kin(4:6, i) = R'*p20;
%     kin(7:9, i) = R'*p30;
%     kin(10:12, i) = R'*p40;
%     kin(13:15, i) = R'*p50;
%     kin(16:18, i) = R'*p60;
%     Qp1(:, :, i) = Qp_ground;
%     Qp2(:, :, i) = Qp_ground;
%     Qp3(:, :, i) = Qp_ground;
%     Qp4(:, :, i) = Qp_ground;
%     Qp5(:, :, i) = Qp_ground;
%     Qp6(:, :, i) = Qp_ground;
% end
% for i = 1002:10000
%     
%     R = rotation_xyz([angle; 0; 0]);
%     kin(1:3, i) = R'*p10;
%     kin(4:6, i) = R'*p20;
%     kin(7:9, i) = R'*p30;
%     kin(10:12, i) = R'*p40;
%     kin(13:15, i) = R'*p50;
%     kin(16:18, i) = R'*p60;
%     Qp1(:, :, i) = Qp_ground;
%     Qp2(:, :, i) = Qp_ground;
%     Qp3(:, :, i) = Qp_ground;
%     Qp4(:, :, i) = Qp_ground;
%     Qp5(:, :, i) = Qp_ground;
%     Qp6(:, :, i) = Qp_ground;
% end





% direct kinematic
%kin = [p10; p20; p30; p40; p50; p60];

% initialize covariance matriz with high values on the diagonal
P_pos = 1e-8*eye(33);
% P_pos = [1e3*eye(27), zeros(27, 6);
%          zeros(6, 27), zeros(6)];

% imu values for test
acel(:, 1) = [0; 0; -9.81];
gyro(:, 1) = [0; 0; 0];

g = [0; 0; -9.81];

% teste translação

for i = 1:500
    acel(:,i) = [0;0; -9.81];
    gyro(:,i) = [0;0;0];
end
for i = 501:801
    acel(:, i) = [0; 1; -9.81];
    gyro(:, i) = [0;0;0];
end
for i = 802:1201
    acel(:,i) = [0;0; -9.81];
    gyro(:,i) = [0;0;0];
end
for i = 1202:1501
    acel(:, i) = [0; -1; -9.81];
    gyro(:, i) = [0;0;0];
end
for i = 1502:10000
    acel(:,i) = [0;0; -9.81];
    gyro(:,i) = [0;0;0];
end
% figure
% plot(t(1:length(t)-1), acel(1,:))
% figure
% plot(t(1:length(t)-1), gyro(1,:))



% teste rotação
% n=0;
% for i = 1:501
%     angle = pi/3000*(i-1);
%     R = rotation_xyz([angle; 0; 0]);
%     %acel(:, i) = n*rand(3,1)+[9.81*sin(angle); 0; -9.81*cos(angle)];
%     acel(:, i) = n*rand(3,1)+ R'*g;
%     gyro(:, i) = n*rand(3,1)+[pi/3; 0; 0];
% end
% for i = 502:1001
%     angle = pi/3000*(1000 - (i-1));
%     R = rotation_xyz([angle;0; 0]);
% %     acel(:, i) = n*rand(3,1)+[9.81*sin(angle); 0; -9.81*cos(angle)];
% %     gyro(:, i) = n*rand(3,1)+[0; -pi/3; 0];
%     acel(:, i) = n*rand(3,1)+ R'*g;
%     gyro(:, i) = n*rand(3,1)+[-pi/3; 0; 0];
% end
% angle = pi/3000*(1000 - (1001-1));
% R = rotation_xyz([angle;0; 0]);
% acel(:, 101) = [0; 0; -9.81];
% gyro(:, 101) = [0; 0; 0];
% 
% for i = 1002:10000
%    
%     acel(:, i) = n*rand(3,1)+R'*g;
%     gyro(:, i) = n*rand(3,1)+[0; 0; 0];
% end
% 



tic

% initial state
x_pos(:,1) = [r0; v0; q0; p10; p20; p30; p40; p50; p60; bf0; bw0];

% just define x_pre as column vector
x_pre(:,1) = zeros(34,1);

Qf = 0.00005*eye(3);
Qw = 0.00005*eye(3);
Qbf = 0.00001*eye(3);
Qbw = 0.00001*eye(3);
%Qp = 0.0001*eye(3);

% first prediction step
    
    Ck_pos = BtoI(x_pos(7:10, 1));
    fk = acel(:, 1) - x_pos(29:31, 1);
    wk = gyro(:, 1) - x_pos(32:34, 1);
%     fk = acel(:, 1) ;
%     wk = gyro(:, 1) ;
    % r
    x_pre(1:3, 2) = x_pos(1:3, 1) + dt*x_pos(4:6, 1) + dt^2/2*(Ck_pos*fk - g);
    %  v
    x_pre(4:6, 2) = x_pos(4:6, 1) + dt*(Ck_pos*fk - g);
    % q
    x_pre(7:10, 2) = quat_mult(app(dt*wk), x_pos(7:10, 1));
    %p1, p2, p3, p4, p5, p6
    x_pre(11:28, 2) = x_pos(11:28, 1);
    % bf
    x_pre(29:31, 2) = x_pos(29:31, 1);
    % bw
    x_pre(32:34, 2) = x_pos(32:34, 1);
    
    Fk = [eye(3), dt*eye(3), -dt^2/2*Ck_pos*ssm(fk), zeros(3, 18), -dt^2/2*Ck_pos, zeros(3);
          zeros(3), eye(3), -dt*Ck_pos*ssm(fk), zeros(3, 18), - dt*Ck_pos, zeros(3);
          zeros(3), zeros(3), fgamma(0, dt, wk)', zeros(3, 18), zeros(3), -fgamma(1, dt, wk)';
          zeros(18, 3), zeros(18, 3), zeros(18, 3), eye(18), zeros(18, 3), zeros(18, 3);
          zeros(3), zeros(3), zeros(3), zeros(3, 18), eye(3), zeros(3);
          zeros(3), zeros(3), zeros(3), zeros(3, 18), zeros(3), eye(3)];
    %Fk = sparse(Fk);
      
    aux = [dt*Ck_pos*Qp1(:,:,1)*Ck_pos', zeros(3,15);
           zeros(3,3), dt*Ck_pos*Qp2(:,:,1)*Ck_pos', zeros(3,12);
           zeros(3,6), dt*Ck_pos*Qp3(:,:,1)*Ck_pos', zeros(3,9);
           zeros(3,9), dt*Ck_pos*Qp4(:,:,1)*Ck_pos', zeros(3,6);
           zeros(3,12), dt*Ck_pos*Qp5(:,:,1)*Ck_pos', zeros(3,3);
           zeros(3,15), dt*Ck_pos*Qp6(:,:,1)*Ck_pos'] ; 
    Qk = [dt^3/3*Qf + dt^5/20*Qbf, dt^2/2*Qf+dt^4/8*Qbf, zeros(3), zeros(3,18), -dt^3/6*Ck_pos*Qbf, zeros(3);
         dt^2/2*Qf+dt^4/8*Qbf, dt*Qf + dt^3/3*Qbf, zeros(3), zeros(3,18), -dt^2/2*Ck_pos*Qbf, zeros(3);
         zeros(3), zeros(3), dt*Qw + (fgamma(3, dt, wk)+(fgamma(3, dt, wk))')*Qbw, zeros(3,18), zeros(3), (-fgamma(2, dt, wk))';
         zeros(18,3), zeros(18,3), zeros(18,3), aux,  zeros(18,3), zeros(18,3);
         -dt^3/6*Qbf*Ck_pos', -dt^2/2*Qbf*Ck_pos', zeros(3), zeros(3, 18), dt*Qbf, zeros(3);
         zeros(3), zeros(3), -Qbw*fgamma(2,dt, wk), zeros(3,18), zeros(3), dt*Qbw];
    %Qk = sparse(Qk);
    P_pre = Fk*P_pos*Fk' + Qk;


Rsk = var_kine*eye(18);
Rak = var_servo*eye(18);
%Rsk = sparse(Rsk);
%Rak = sparse(Rak);
J = 0.0001*ones(18);
%J = sparse(J);
Rk = Rsk+J*Rak*J';

for k = 2:10000
    % update step 
    
    Ck_pre = BtoI(x_pre(7:10, k));
    yk = [kin(1:3, k) - Ck_pre'*(x_pre(11:13, k) - x_pre(1:3, k));
               kin(4:6, k) - Ck_pre'*(x_pre(14:16, k) - x_pre(1:3, k));
               kin(7:9, k) - Ck_pre'*(x_pre(17:19, k) - x_pre(1:3, k));
               kin(10:12, k) - Ck_pre'*(x_pre(20:22, k) - x_pre(1:3, k));
               kin(13:15, k) - Ck_pre'*(x_pre(23:25, k) - x_pre(1:3, k));
               kin(16:18, k) - Ck_pre'*(x_pre(26:28, k) - x_pre(1:3, k))];
    
   Hk = [-Ck_pre', zeros(3), ssm(Ck_pre'*(x_pre(11:13, k) - x_pre(1:3, k))) , Ck_pre', zeros(3,15), zeros(3), zeros(3);
          -Ck_pre', zeros(3), ssm(Ck_pre'*(x_pre(14:16, k) - x_pre(1:3, k))), zeros(3,3), Ck_pre', zeros(3,12), zeros(3), zeros(3);
          -Ck_pre', zeros(3), ssm(Ck_pre'*(x_pre(17:19, k) - x_pre(1:3, k))), zeros(3,6), Ck_pre', zeros(3,9), zeros(3), zeros(3);
          -Ck_pre', zeros(3), ssm(Ck_pre'*(x_pre(20:22, k) - x_pre(1:3, k))), zeros(3,9), Ck_pre', zeros(3,6), zeros(3), zeros(3);
          -Ck_pre', zeros(3), ssm(Ck_pre'*(x_pre(23:25, k) - x_pre(1:3, k))), zeros(3,12), Ck_pre', zeros(3,3), zeros(3), zeros(3);
          -Ck_pre', zeros(3), ssm(Ck_pre'*(x_pre(26:28, k) - x_pre(1:3, k))), zeros(3,15), Ck_pre', zeros(3), zeros(3)];
   %Hk = sparse(Hk); 
   Sk = Hk*P_pre*Hk' + Rk;
   Kk = P_pre*Hk'*inv(sparse(Sk));
   delta_x = Kk* yk;
   
   P_pos = (eye(33) - Kk*Hk)*P_pre;
   
   
   % update the state vector
   % r,v
   x_pos(1:6, k) = x_pre(1:6, k) + delta_x(1:6);
   % q
   x_pos(7:10, k) = quat_mult(app(delta_x(7:9)), x_pre(7:10, k));
   % p, bf, bw
   x_pos(11:34, k) = x_pre(11:34, k) + delta_x(10:33);
      
   theta(k) = acos(x_pos(10, k))*2;
      
      
      
    % prediction step
    
    Ck_pos = BtoI(x_pos(7:10, k));
    fk = acel(:, k) - x_pos(29:31, k);
    wk = gyro(:, k) - x_pos(32:34, k);
%     fk = acel(:, 1) ;
%     wk = gyro(:, 1) ;
    % r
    x_pre(1:3, k+1) = x_pos(1:3, k) + dt*x_pos(4:6, k) + dt^2/2*(Ck_pos*fk - g);
    %  v
    x_pre(4:6, k+1) = x_pos(4:6, k) + dt*(Ck_pos*fk - g);
    % q
    x_pre(7:10, k+1) = quat_mult(app(dt*wk), x_pos(7:10, k));
    %p1, p2, p3, p4, p5, p6
    x_pre(11:28, k+1) = x_pos(11:28, k);
    % bf
    x_pre(29:31, k+1) = x_pos(29:31, k);
    % bw
    x_pre(32:34, k+1) = x_pos(32:34, k);
    
    Fk = [eye(3), dt*eye(3), -dt^2/2*Ck_pos*ssm(fk), zeros(3, 18), -dt^2/2*Ck_pos, zeros(3);
          zeros(3), eye(3), -dt*Ck_pos*ssm(fk), zeros(3, 18), - dt*Ck_pos, zeros(3);
          zeros(3), zeros(3), fgamma(0, dt, wk)', zeros(3, 18), zeros(3), -fgamma(1, dt, wk)';
          zeros(18, 3), zeros(18, 3), zeros(18, 3), eye(18), zeros(18, 3), zeros(18, 3);
          zeros(3), zeros(3), zeros(3), zeros(3, 18), eye(3), zeros(3);
          zeros(3), zeros(3), zeros(3), zeros(3, 18), zeros(3), eye(3)];
    %Fk = sparse(Fk);
    
    aux = [dt*Ck_pos*Qp1(:,:,k)*Ck_pos', zeros(3,15);
           zeros(3,3), dt*Ck_pos*Qp2(:,:,k)*Ck_pos', zeros(3,12);
           zeros(3,6), dt*Ck_pos*Qp3(:,:,k)*Ck_pos', zeros(3,9);
           zeros(3,9), dt*Ck_pos*Qp4(:,:,k)*Ck_pos', zeros(3,6);
           zeros(3,12), dt*Ck_pos*Qp5(:,:,k)*Ck_pos', zeros(3,3);
           zeros(3,15), dt*Ck_pos*Qp6(:,:,k)*Ck_pos'] ; 
      
    Qk = [dt^3/3*Qf + dt^5/20*Qbf, dt^2/2*Qf+dt^4/8*Qbf, zeros(3), zeros(3,18), -dt^3/6*Ck_pos*Qbf, zeros(3);
         dt^2/2*Qf+dt^4/8*Qbf, dt*Qf + dt^3/3*Qbf, zeros(3), zeros(3,18), -dt^2/2*Ck_pos*Qbf, zeros(3);
         zeros(3), zeros(3), dt*Qw + (fgamma(3, dt, wk)+fgamma(3, dt, wk)')*Qbw, zeros(3,18), zeros(3), -fgamma(2, dt, wk)';
         zeros(18,3), zeros(18,3), zeros(18,3), aux,  zeros(18,3), zeros(18,3);
         -dt^3/6*Qbf*Ck_pos', -dt^2/2*Qbf*Ck_pos', zeros(3), zeros(3, 18), dt*Qbf, zeros(3);
         zeros(3), zeros(3), -Qbw*fgamma(2,dt, wk), zeros(3,18), zeros(3), dt*Qbw];
    %Qk = sparse(Qk);
    P_pre = Fk*P_pos*Fk'+ Qk;
      
end
toc
figure
plot(t(1:length(t)-1), x_pos(1,:))
hold on
plot(t, x_pre(1,:), 'r')
legend('pos', 'pre')
title('x')

figure
plot(t(1:length(t)-1), x_pos(2,:))
hold on
plot(t, x_pre(2,:), 'r')
legend('pos', 'pre')
title('y')

figure
plot(t(1:length(t)-1), x_pos(3,:))
hold on
plot(t, x_pre(3,:), 'r')
legend('pos', 'pre')
title('z')

figure
plot(t(1:length(t)-1), theta)
title('theta')