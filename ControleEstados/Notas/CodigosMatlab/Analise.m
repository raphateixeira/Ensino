cd('C:\Users\Raphael Teixeira\Documents\GitHubRTx\ControleEstados\Notas\imgs');

A = [0 1 0; 0 0 1; -1 -5 -6];
p = eig(A);

% Ordenar polos por parte real
[~, idx] = sort(real(p));
p = p(idx);

figure('Position', [100 100 700 500]);
hold on;

% Linhas de amortecimento
zgrid = [0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9];
for z = zgrid
    ang = acos(z);
    plot([-8*cos(ang) 0], [-8*sin(ang) 0], 'Color', [0.7 0.7 0.7], 'LineWidth', 0.5);
    plot([-8*cos(ang) 0], [8*sin(ang) 0],  'Color', [0.7 0.7 0.7], 'LineWidth', 0.5);
end

% Círculos de frequência natural
for wn = 1:7
    t = linspace(pi/2, pi, 200);
    plot(wn*cos(t),  wn*sin(t),  'Color', [0.7 0.7 0.7], 'LineWidth', 0.5);
    plot(wn*cos(t), -wn*sin(t), 'Color', [0.7 0.7 0.7], 'LineWidth', 0.5);
end

% Eixos
xline(0, 'k--', 'Alpha', 0.4);
yline(0, 'k--', 'Alpha', 0.4);
grid on;

% Polos
plot(real(p), imag(p), 'rx', 'MarkerSize', 14, 'LineWidth', 2.5);

% Anotações: p3 acima, p2 abaixo, p1 acima
offsets = [0.1 0.3; 0.1 -0.5; 0.1 0.3];
labels = {'p_3', 'p_2', 'p_1'};
for i = 1:length(p)
    text(real(p(i)) + offsets(i,1), imag(p(i)) + offsets(i,2), ...
        sprintf('%s = %.3f', labels{i}, real(p(i))), ...
        'FontSize', 11, 'Color', 'k');
end

xlabel('Re(s)'); ylabel('Im(s)');
title('Polos de Malha Aberta');
xlim([-7 1]); ylim([-3 3]);
saveas(gcf, 'PolosMalhaAberta.png');