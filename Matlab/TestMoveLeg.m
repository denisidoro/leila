clear all
close all

d1 = 43.7865;
d2 = 91.82;

d = d1+ d2;
d3 = 131.82;
U = zeros(6,3);



delta_y = 160; %Step size
x_0 = [0;0;0];
rot = [0;0;0];

x_f = [0;0;0];
rot_f = [0;0;0];

x_P = zeros(6, 3);
U(1,:) = [x_0(1) - d2 - 100; x_0(2) + d3 + 50; x_0(3)-80].';
U(2,:) = [x_0(1) + d2 + 100; x_0(2) + d3 + 50; x_0(3)-80].';
U(3,:) = [x_0(1) - d - 100; x_0(2); x_0(3) - 80].';
U(4,:) = [x_0(1) + d + 100; x_0(2); x_0(3) - 80].';
U(5,:) = [x_0(1) - d2 - 100; x_0(2) - d3 - 50; x_0(3) - 80].';
U(6,:) = [x_0(1) + d2 + 100; x_0(2) - d3 - 50; x_0(3) - 80].';

%u_f = [x_0(1) + d2 + 100; x_0(2) - d3 - 150; x_0(3) - 80]; % 6
%u_f = [x_0(1) - d2 - 100; x_0(2) + d3 + 150; x_0(3)-80]; % 1
%u_f = [x_0(1) + d + 100; x_0(2)+100; x_0(3) - 80]; % 4
%u_f = [x_0(1) + d2 + 100; x_0(2) + d3 - 100; x_0(3)-80] % 2


steps = 6;
frames = 10;
%F(steps*frames) = struct('cdata',[],'colormap',[]);

for i = 1:steps

    
    if i == 1
        delta_y_eff = delta_y/2;
        x_f = x_0 + [0;delta_y_eff;0];
    elseif i == steps
        delta_y_eff = delta_y/2; 
        x_f = x_0;
    else
        delta_y_eff = delta_y;
        x_f = x_0 + [0;delta_y_eff/2;0];
    end
    
    
    dif_x = x_f - x_0;
    dif_rot = rot_f - rot;
    x_00 = x_0;
    rot_0 = rot;
    
    if mod(i,2) == 1
       %Move legs 1, 4 and 5
        u_f1 = U(1,:).' + [0;delta_y_eff;0];
        u_f4 = U(4,:).' + [0;delta_y_eff;0];
        u_f5 = U(5,:).' + [0;delta_y_eff;0];
        T1 = planLegParabola(1, U(1,:).', u_f1, x_0, rot, [0;0;0], frames-1);
        T4 = planLegParabola(4, U(4,:).', u_f4, x_0, rot, [0;0;0], frames-1);
        T5 = planLegParabola(5, U(5,:).', u_f5, x_0, rot, [0;0;0], frames-1);
        
        
    else
       %Move legs 2, 3 and 6
        u_f2 = U(2,:).' + [0;delta_y_eff;0];
        u_f3 = U(3,:).' + [0;delta_y_eff;0];
        u_f6 = U(6,:).' + [0;delta_y_eff;0];
        T2 = planLegParabola(2, U(2,:).', u_f2, x_0, rot, [0;0;0], frames-1);
        T3 = planLegParabola(3, U(3,:).', u_f3, x_0, rot, [0;0;0], frames-1);
        T6 = planLegParabola(6, U(6,:).', u_f6, x_0, rot, [0;0;0], frames-1);
                
    end
      
    for k=1:frames

            close all
            figure     

            if mod(i,2) == 1
                U(1,:) = T1(:,k).';
                U(4,:) = T4(:,k).';
                U(5,:) = T5(:,k).';   
            
            else 
                U(2,:) = T2(:,k).';
                U(3,:) = T3(:,k).';
                U(6,:) = T6(:,k).'; 
            end
            
            [X, P, R] = BuildSpider(x_0, rot, U);
            
            %%Plot normal
            normal = R*[0;0;1];
            a = 80*normal(1);
            b = 80*normal(2);
            c = 80*normal(3);
            p_normal = [x_0(1)+a; x_0(2)+b; x_0(3)+c];
            %verif = dot(x_0-X(1,:).', p_normal)

            xn = [x_0(1), p_normal(1)];
            yn = [x_0(2), p_normal(2)];
            zn = [x_0(3), p_normal(3)];
            plot3(xn,yn,zn,'-om', 'Linewidth',5);


            x_0(1) = x_00(1) + k* dif_x(1)/frames;
            x_0(2) = x_00(2) + k* dif_x(2)/frames;
            x_0(3) = x_00(3) + k* dif_x(3)/frames;

            rot(1) = rot_0(1) + k* dif_rot(1)/frames;
            rot(2) = rot_0(2) + k* dif_rot(2)/frames;
            rot(3) = rot_0(3) + k* dif_rot(3)/frames;

            plotSpider(X,P);

            F(k+frames*(i-1)) = getframe;
    end
    %************************************* important
    x_0 = x_f;
    if mod(i,2) == 1
        U(1,:) = u_f1.';
        U(4,:) = u_f4.';
        U(5,:) = u_f5.';
        
   else
       U(2,:) = u_f2.';
       U(3,:) = u_f3.';
       U(6,:) = u_f6.';    
    end
  
end

U(1,:)
U(2,:)
U(3,:)
U(4,:)
U(5,:)
U(6,:)

for i=1:frames
    %F(frames+i)=F(frames-i+1);
end

for i=1:3*frames
    %F(2*frames+i)=F(i);
end
%movie(F,-3)
movie2avi(F,'myfile.avi');