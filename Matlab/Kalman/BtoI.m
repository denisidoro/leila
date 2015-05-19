function M = BtoI( q )

qi = q(1);
qj = q(2);
qk = q(3);
qr = q(4);

M = [1-2*qj^2-2*qk^2, 2*qi*qj-2*qk*qr, 2*qi*qk+2*qj*qr;
    2*qi*qj+2*qk*qr, 1-2*qi^2-2*qk^2, 2*qj*qk-2*qi*qr; 
    2*qi*qk-2*qj*qr, 2*qj*qk+2*qi*qr, 1-2*qi^2-2*qj^2];

end
