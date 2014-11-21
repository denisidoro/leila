clear all
close all

d1 = 43.7865;
d2 = 91.82;

d = d1+ d2;
d3 = 131.82;
U = zeros(6,3);
U(1,:) = [ - d2 - 50;  d3 + 130;  - 80];
U(2,:) = [ + d2 + 50; d3 + 130; - 80];
U(3,:) = [ - d - 50; 0; -80];
U(4,:) = [ + d + 50; 0; -80];
U(5,:) = [ - d2 - 50;  - d3 - 130;  - 80];
U(6,:) = [ + d2 + 50;  - d3 - 130;  - 80];


% Translação em x
frames = 2
F(2*frames) = struct('cdata',[],'colormap',[]);
x_0 = [0;0;0];
rot = [0;0;0];

x_f = [0;30;45];
rot_f = [0;pi/2;pi/20];

for k=1:frames
    
        close all
        figure

        [X, P, R] = BuildSpider(x_0, rot, U);
        
        x_0(1) = x_0(1) + k* (x_f(1)-x_0(1))/frames;
        x_0(2) = x_0(2) + k* (x_f(2)-x_0(2))/frames;
        x_0(3) = x_0(3) + k* (x_f(3)-x_0(3))/frames;
        
        rot(1) = rot(1) + k* (rot_f(1)-rot(1))/frames;
        rot(2) = rot(2) + k* (rot_f(2)-rot(2))/frames;
        rot(3) = rot(3) + k* (rot_f(3)-rot(3))/frames;
        
         
        %%Plot normal
        normal = R*[0;0;1];
        a = 50*normal(1);
        b = 50*normal(2);
        c = 50*normal(3);
        p_normal = [x_0(1)+a; x_0(2)+b; x_0(3)+c];
         %verif = dot(x_0-X(1,:).', p_normal)
        
        xn = [x_0(1), p_normal(1)];
        yn = [x_0(2), p_normal(2)];
        zn = [x_0(3), p_normal(3)];
        plot3(xn,yn,zn,'-oy', 'Linewidth',5);

        %%Plot estrutura
        x_Pr = X;
        x = [x_Pr(1,1), x_Pr(3,1), x_Pr(5,1), x_Pr(6,1), x_Pr(4,1), x_Pr(2,1),x_Pr(1,1)];
        y = [x_Pr(1,2), x_Pr(3,2), x_Pr(5,2), x_Pr(6,2), x_Pr(4,2), x_Pr(2,2),x_Pr(1,2)];
        z = [x_Pr(1,3), x_Pr(3,3), x_Pr(5,3), x_Pr(6,3), x_Pr(4,3), x_Pr(2,3),x_Pr(1,3)];

        xx = [x_Pr(1,1), x_Pr(6,1), x_Pr(5,1),x_Pr(2,1),x_Pr(1,1)];
        yy = [x_Pr(1,2), x_Pr(6,2), x_Pr(5,2),x_Pr(2,2),x_Pr(1,2)];
        zz = [x_Pr(1,3), x_Pr(6,3), x_Pr(5,3),x_Pr(2,3),x_Pr(1,3)];
        hold on
        plot3(x,y,z, '-o', 'Linewidth',5);
        plot3(xx,yy,zz, 'r','Linewidth',5);

        for i=1:6
            x_i = [P(i,1,1), P(i,2,1), P(i,3,1), P(i,4,1)];
            y_i = [P(i,1,2), P(i,2,2), P(i,3,2), P(i,4,2)];
            z_i = [P(i,1,3), P(i,2,3), P(i,3,3), P(i,4,3)];
            plot3(x_i,y_i,z_i,'-og','Linewidth',5);
        end    
        grid
        axis tight manual
        %axis vis3d
        axis([-400, 400, -400, 400, -80,200])
        view([65, 45])
    F(k) = getframe;
end  

for i=1:frames
    F(frames+i)=F(frames-i+1);
end

for i=1:3*frames
    F(2*frames+i)=F(i);
end
movie(F,-1)
 
