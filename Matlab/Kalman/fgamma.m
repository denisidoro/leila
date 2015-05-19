function T = fgamma( n, dt, w)
% Auxiliary quantity gamma 

T = zeros(3);
for i = 0:2
    T = T + dt^(i+n)*ssm(w)^i/(factorial(i+n));
end

end

