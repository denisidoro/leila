function [ A ] = plotSpider( X, P )

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
           % x_i = [P(1,1,1), P(1,2,1), P(1,3,1), P(1,4,1)];
           %y_i = [P(1,1,2), P(1,2,2), P(1,3,2), P(1,4,2)];
           %z_i = [P(1,1,3), P(1,2,3), P(1,3,3), P(1,4,3)];
           %plot3(x_i,y_i,z_i,'-or','Linewidth',5);
        
        grid
        axis tight manual
        %axis vis3d
        axis([-600, 600, -600, 600, -80,400])
        view([20,45])

A = []
end

