clear all
close all
%%%% Defini��o da base

%Constantes
numFrames = 10;

%Centro da base
%x_input = input('Centro da base: ');
x_input = [0;0;0];

%Matrix de rota��o
%rot_input = input('Angulos de rota��o: ')
rot_input = [0;0;pi/12];

for i = 1:numFrames
	x_this = [x_input(1)*i/numFrames; x_input(2)*i/numFrames; x_input(3)*i/numFrames];
	rot_this = [rot_input(1)*i/numFrames; rot_input(2)*i/numFrames; rot_input(3)*i/numFrames];
    M(i) = plot_araignee(x_this, rot_this);
end

close all;
movie(M);
