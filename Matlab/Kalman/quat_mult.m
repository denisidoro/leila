function p = quat_mult( q1, q2 )
% Quaternion multiplication
% q1 = a*i + b*j + c*k +d
% q2 = qi*i +qj*j + qk*k +qr
a = q1(1);
b = q1(2);
c = q1(3);
d = q1(4);

qi = q2(1);
qj = q2(2);
qk = q2(3);
qr = q2(4);

p = [a*qr+b*qk-c*qj+d*qi;
    -a*qk+b*qr+c*qi+d*qj;
    a*qj-b*qi+c*qr+d*qk;
    -a*qi-b*qj-c*qk+d*qr];

end

