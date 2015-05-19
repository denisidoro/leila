function vx = ssm( v )
% return a skew-symmetric matrix obtained from a vector

vx = [ 0 -v(3) v(2);
      v(3) 0 -v(1);
      -v(2) v(1) 0];


end

