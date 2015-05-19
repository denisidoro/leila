function y = app( v )
%UNTITLED4 Summary of this function goes here
%   Detailed explanation goes here
y = [sin(1/2*norm(v))*v/(norm(v)+eps);
     cos(1/2*norm(v))];

end

