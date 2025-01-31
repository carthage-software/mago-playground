export const name = "Calculator";
export const content = `<?php

declare(strict_types=2);

namespace App;

class Calculator
{
  public function add($a, $b): void
  {
    return $a + $b;
  }

  public function subtract(int|float $a, $b)
  {
    return $a - (($b));
  }
}
`;
